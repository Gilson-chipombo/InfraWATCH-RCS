'use client'

import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";

export default function SqlEditor() {
  const [code, setCode] = useState("SELECT * FROM users;");

  return (
    <div className="p-4">
      <CodeMirror
        value={code}
        height="200px"
        extensions={[sql()]}
        onChange={(value) => setCode(value)}
        theme="dark"
      />
      <pre className="mt-4 p-2 bg-gray-900 text-green-400 rounded">
        {code}
      </pre>
    </div>
  );
}
