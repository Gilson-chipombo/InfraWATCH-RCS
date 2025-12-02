"use server";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./src/actions/grpc/chat.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat as any;

export async function sendGrpcCommand(
  host: string,
  port: number,
  password: string,
  command: string
) {
  return new Promise((resolve, reject) => {
    const client = new chatProto.ChatService(
      `${host}:${port}`,
      grpc.credentials.createInsecure()
    );

    const metadata = new grpc.Metadata();
    metadata.add("auth-key", password);

    const call = client.Chat(metadata);
    let responses: any[] = [];
    let resolved = false;

    call.on("data", (message: any) => {
      try {
        let data;
        try {
          data = JSON.parse(message.text || message.response || "{}");
        } catch {
          data = message.text || message.response;
        }
        responses.push(data);
      } catch {
        responses.push(message.text || message.response);
      }
    });

    call.on("end", () => {
      if (!resolved) {
        resolved = true;
        resolve(responses.length > 0 ? responses[responses.length - 1] : null);
      }
    });

    call.on("error", (err: any) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    // timeout de segurança
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(responses.length > 0 ? responses[responses.length - 1] : { error: "Timeout" });
        call.end();
      }
    }, 10000);

    // envia o comando
    call.write({ user: "Next.js Client", text: command });

    // 🚨 não fecha imediatamente!
    // aguarda 200ms (ou até vir "end") para dar tempo do servidor responder
    setTimeout(() => {
      call.end();
    }, 200);
  });
}