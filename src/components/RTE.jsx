import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';

export default function RTE({ name, control, label }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full mb-4">
      {label && (
        <label className="inline-block mb-1 pl-1 font-semibold">{label}</label>
      )}

      <div
        className={`border rounded-xl transition-colors duration-200 ${
          focused ? "border-white" : "border-gray-300"
        }`}
        style={{ width: "100%", maxWidth: "700px" }}
      >
        <Controller
          name={name || "content"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Editor
              apiKey="rn9raclgl5j3s92ad9wkgkwfrtnr3akt6d8gb5kfuukikj34"
              value={value}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                  "searchreplace", "visualblocks", "code", "fullscreen",
                  "insertdatetime", "media", "table", "help", "wordcount"
                ],
                toolbar:
                  "undo redo | blocks | image | bold italic forecolor | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
              onEditorChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          )}
        />
      </div>
    </div>
  );
}