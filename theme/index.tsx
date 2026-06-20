import {
  Layout as BasicLayout,
  type LayoutProps,
} from '@rspress/core/theme-original';
import { NoteBoard } from './NoteBoard';

import 'katex/dist/katex.min.css';
import './styles.css';

export * from '@rspress/core/theme-original';

export function Layout(props: LayoutProps) {
  return (
    <BasicLayout
      {...props}
      afterHero={
        <>
          {props.afterHero}
          <NoteBoard variant="home" />
        </>
      }
      beforeSidebar={
        <>
          {props.beforeSidebar}
          <NoteBoard variant="sidebar" />
        </>
      }
    />
  );
}
