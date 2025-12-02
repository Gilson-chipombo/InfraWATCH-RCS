import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  email: string;
  telefone: string;
  mensagem: string;
}

interface EmailTemplatePostProps {
  id: string,
  name: string,
  capa: string,
  postTitle: string,
  postDescription: string,
  content: string,
}

export function EmailTemplate({ name, email, telefone, mensagem }: EmailTemplateProps) {
  return (
    <div>
      <h1>E-mail de , {name}!</h1>
      <p>Email: {email}</p>
      <p>Telefone: {telefone}</p>
      <p>Mensagem: {mensagem}</p>
    </div>
  );
}


export function EmailTemplatePost({
  id,
  capa,
  name,
  postTitle,
  postDescription,
  content
}: EmailTemplatePostProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.5" }}>
      <h1 style={{ marginBottom: "8px" }}>{postTitle}</h1>
      <p style={{ margin: "4px 0", color: "#555" }}>{postDescription}</p>

      <h2 style={{ marginTop: "20px" }}>Oi, {name}!</h2>
      <p>Nova postagem disponível!</p>
      <hr style={{ margin: "16px 0" }} />

      {capa && (
        <div
          style={{
            backgroundImage: `url('${capa}')`,
            backgroundSize: "cover", // "content" não é válido no CSS
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "100%",
            height: "400px",
            borderRadius: "16px"
          }}
        />
      )}

      <p style={{ marginTop: "20px" }}>
        <a
          href={`https://school-admin.mrbody.me/posts/${id}`}
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          Ver postagem completa
        </a>
      </p>

      <div
        style={{ marginTop: "16px" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
