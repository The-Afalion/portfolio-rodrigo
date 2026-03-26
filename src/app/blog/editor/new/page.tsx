"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [fontFamily, setFontFamily] = useState('font-serif'); // Opciones: font-serif, font-sans, font-mono
  const [isPublishing, setIsPublishing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Escribe aquí tu elegante proyecto...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  const handlePublish = async () => {
    if (!editor || !title) return;
    setIsPublishing(true);

    // Aquí implementaremos la lógica de guardado
    // await fetch('/api/blog/posts', ...)

    alert('Función de guardado en construcción');
    setIsPublishing(false);
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-16 px-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Nuevo Artículo</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/blog/editor')}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header del Editor (Título y Tipografía) */}
          <div className="border-b border-slate-100 p-6 flex flex-col gap-4 bg-slate-50/50">
            <input
              type="text"
              placeholder="Título del Proyecto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-serif font-bold bg-transparent border-none outline-none text-slate-900 placeholder-slate-300 w-full"
            />

            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Tipografía Base:</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="font-serif">Serif (Elegante)</option>
                <option value="font-sans">Sans-Serif (Moderna)</option>
                <option value="font-mono">Monospace (Técnica)</option>
              </select>
            </div>
          </div>

          {/* Barra de Herramientas del Editor (Estilo Word) */}
          <div className="border-b border-slate-100 p-3 flex flex-wrap gap-2 bg-white sticky top-0 z-10">
            <div className="flex gap-1 border-r border-slate-200 pr-2">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-100 ${editor.isActive('bold') ? 'bg-slate-200 font-bold' : ''}`}><b>B</b></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-100 italic ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}>I</button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded hover:bg-slate-100 line-through ${editor.isActive('strike') ? 'bg-slate-200' : ''}`}>S</button>
            </div>

            <div className="flex gap-1 border-r border-slate-200 pr-2">
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-100 font-serif font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}>H2</button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-slate-100 font-serif font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}`}>H3</button>
            </div>

            <div className="flex gap-1 border-r border-slate-200 pr-2">
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200' : ''}`}>Left</button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200' : ''}`}>Center</button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200' : ''}`}>Right</button>
            </div>

            <div className="flex gap-2 pl-2">
              <button
                onClick={() => alert('Próximamente: Añadir Timeline')}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md flex items-center gap-2"
              >
                + Añadir Timeline
              </button>
              <button
                onClick={() => alert('Próximamente: Añadir Modelo 3D')}
                className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md flex items-center gap-2"
              >
                + Añadir Modelo 3D
              </button>
              <button
                onClick={() => alert('Próximamente: Añadir Multimedia')}
                className="px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md flex items-center gap-2"
              >
                + Imagen / Video
              </button>
            </div>
          </div>

          {/* Área de Edición */}
          <div className={`p-8 flex-grow ${fontFamily}`}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
