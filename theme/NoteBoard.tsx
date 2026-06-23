const NOTE =
  'V1.5.1 笔记内容全部更新完毕，修复页面展示无法折叠边栏问题 最后的波纹喵';

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
