import MDEditor from '@uiw/react-md-editor';

interface MarkdownPreviewProps {
  content: string;
}

/**
 * Renders markdown content as HTML.
 * Uses @uiw/react-md-editor's built-in preview which handles
 * sanitization to prevent XSS from markdown content.
 */
export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div data-color-mode="dark">
      <MDEditor.Markdown
        source={content}
        style={{ backgroundColor: 'transparent', color: 'inherit' }}
      />
    </div>
  );
}
