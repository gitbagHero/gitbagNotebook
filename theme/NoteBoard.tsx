const NOTE =
  'V1.6.0 添加小测整理 明日2点考试喵';

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
