import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";

// Import TinyMCE core, theme, and plugins locally
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/table';
import 'tinymce/plugins/code';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

export default function RTE({ name, control, label }) {
  const [focused, setFocused] = useState(false);
  const [Editor, setEditor] = useState(null);

  // Dynamically import TinyMCE Editor on client side
  useEffect(() => {
    import("@tinymce/tinymce-react").then(mod => setEditor(() => mod.Editor));
  }, []);

  if (!Editor) return <div>Loading editor...</div>;

  return (
    <div className="w-full mb-4">
      {label && <label className="inline-block mb-1 pl-1 font-semibold">{label}</label>}
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
              value={value}
              onEditorChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
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
                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
