const NOTE =
  'V1.5.0 看到这里说明所有笔记已经更新完毕，后续只有小范围的修改，已经可以使用当前笔记作为正式复习内容 已经没有什么可以传授了喵';

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
