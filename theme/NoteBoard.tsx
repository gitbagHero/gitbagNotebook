const NOTE =
  '根据PPT整理的初版笔记，还未调整冲突内容，未美化笔记格式与排版，后续会更新7-03，7-04的主观题专题笔记等内容，认真复习喵';

interface NoteBoardProps {
  variant: 'home' | 'sidebar';
}

export function NoteBoard({ variant }: NoteBoardProps) {
  return (
    <div className={`note-board note-board--${variant}`} role="note">
      <div className="note-board__heading">
        <span className="note-board__marker" aria-hidden="true" />
        <span>笔记说明</span>
      </div>
      <p>{NOTE}</p>
    </div>
  );
}
