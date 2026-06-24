import { useEffect, useMemo, useState } from 'react';

import quiz251 from '../md笔记/09_小测整理_25-1.md?raw';
import quiz252 from '../md笔记/10_小测整理_25-2.md?raw';
import quiz253 from '../md笔记/11_小测整理_25-3.md?raw';
import quiz261 from '../md笔记/12_小测整理_26-1.md?raw';
import quiz262 from '../md笔记/13_小测整理_26-2.md?raw';

type QuizType = 'fill' | 'choice' | 'judge';
type FilterType = 'all' | QuizType;

interface QuizSource {
  id: string;
  title: string;
  raw: string;
}

interface QuizQuestion {
  id: string;
  source: string;
  sourceTitle: string;
  type: QuizType;
  question: string;
  options: string[];
  answer: string;
  correctChoices: string[];
}

type AnswerMap = Record<string, string | string[]>;
type CheckedMap = Record<string, boolean>;

const SOURCES: QuizSource[] = [
  { id: '25-1', title: '25-1 软件缺陷检测小测', raw: quiz251 },
  { id: '25-2', title: '25-2 软件测试小测', raw: quiz252 },
  { id: '25-3', title: '25-3 白盒/回归/性能小测', raw: quiz253 },
  { id: '26-1', title: '26-1 软件质量保障小测', raw: quiz261 },
  { id: '26-2', title: '26-2 软件质量保障小测', raw: quiz262 },
];

function detectType(sectionTitle: string): QuizType | null {
  if (sectionTitle.includes('填空')) return 'fill';
  if (sectionTitle.includes('选择')) return 'choice';
  if (sectionTitle.includes('判断')) return 'judge';
  return null;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractAnswer(block: string): string {
  const answerMatch = block.match(/\*\*答案：([\s\S]*?)\*\*/);
  return cleanMarkdown(answerMatch?.[1] ?? '');
}

function extractChoices(answer: string): string[] {
  return Array.from(new Set((answer.match(/[A-D]/gi) ?? []).map((item) => item.toUpperCase()))).sort();
}

function parseQuestions(source: QuizSource): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const sections = source.raw.split(/\n(?=##\s+)/g);

  sections.forEach((section) => {
    const sectionTitle = section.match(/^##\s+(.+)$/m)?.[1] ?? '';
    const type = detectType(sectionTitle);
    if (!type) return;

    const blocks = section
      .split(/\n(?=\d+\.\s+)/g)
      .filter((block) => /^\d+\.\s+/.test(block.trim()));

    blocks.forEach((block) => {
      const number = block.match(/^(\d+)\.\s+/)?.[1] ?? String(questions.length + 1);
      const withoutAnswer = block.replace(/\n\s*\*\*答案：[\s\S]*?\*\*/m, '').trim();
      const optionMatches = Array.from(
        withoutAnswer.matchAll(/^\s*([A-D])\.\s+(.+)$/gm),
      );
      const firstOptionIndex = optionMatches[0]?.index ?? -1;
      const questionPart =
        firstOptionIndex >= 0
          ? withoutAnswer.slice(0, firstOptionIndex)
          : withoutAnswer;
      const question = cleanMarkdown(questionPart.replace(/^\d+\.\s+/, ''));
      const options = optionMatches.map((match) => `${match[1].toUpperCase()}. ${cleanMarkdown(match[2])}`);
      const answer = extractAnswer(block);

      if (!question || !answer) return;

      questions.push({
        id: `${source.id}-${type}-${number}`,
        source: source.id,
        sourceTitle: source.title,
        type,
        question,
        options,
        answer,
        correctChoices: type === 'choice' ? extractChoices(answer) : [],
      });
    });
  });

  return questions;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[，,、；;。.\s/（）()【】[\]`"'“”‘’：:|-]/g, '')
    .trim();
}

function normalizeJudge(text: string | string[]): string {
  const value = Array.isArray(text) ? text[0] : text;
  if (['true', '√', '对', '正确', 'yes'].includes(value)) return '√';
  if (['false', '×', '错', '错误', 'no'].includes(value)) return '×';
  return value;
}

function isCorrect(question: QuizQuestion, value: string | string[] | undefined): boolean {
  if (value === undefined) return false;
  if (question.type === 'choice') {
    const selected = Array.isArray(value) ? value.slice().sort() : [];
    return (
      selected.length === question.correctChoices.length &&
      selected.every((item, index) => item === question.correctChoices[index])
    );
  }
  if (question.type === 'judge') {
    return normalizeJudge(value) === question.answer;
  }
  return normalizeText(String(value)) === normalizeText(question.answer);
}

function typeLabel(type: QuizType): string {
  return {
    fill: '填空题',
    choice: '选择题',
    judge: '判断题',
  }[type];
}

function defaultAnswer(question: QuizQuestion): string | string[] {
  return question.type === 'choice' ? [] : '';
}

const ALL_QUESTIONS = SOURCES.flatMap(parseQuestions);
const PAGE_SIZE = 15;

export function QuizPractice() {
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checked, setChecked] = useState<CheckedMap>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const questions = useMemo(
    () =>
      ALL_QUESTIONS.filter((question) => {
        const sourceMatched = sourceFilter === 'all' || question.source === sourceFilter;
        const typeMatched = typeFilter === 'all' || question.type === typeFilter;
        return sourceMatched && typeMatched;
      }),
    [sourceFilter, typeFilter],
  );
  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageQuestions = questions.slice(pageStart, pageStart + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const pageCheckedQuestions = pageQuestions.filter((question) => checked[question.id]);

  const correctCount = pageCheckedQuestions.filter((question) =>
    isCorrect(question, answers[question.id]),
  ).length;

  useEffect(() => {
    setCurrentPage(1);
    setShowAnswers(false);
  }, [sourceFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function setAnswer(question: QuizQuestion, value: string | string[]) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setChecked((current) => ({ ...current, [question.id]: false }));
  }

  function toggleChoice(question: QuizQuestion, choice: string) {
    const current = answers[question.id];
    const selected = Array.isArray(current) ? current : [];
    const next = selected.includes(choice)
      ? selected.filter((item) => item !== choice)
      : [...selected, choice].sort();
    setAnswer(question, next);
  }

  function checkPage() {
    setChecked(
      (current) => ({
        ...current,
        ...Object.fromEntries(pageQuestions.map((question) => [question.id, true])),
      }),
    );
    setShowAnswers(true);
  }

  function resetAll() {
    setAnswers({});
    setChecked({});
    setShowAnswers(false);
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    setShowAnswers(false);

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.querySelector('.quiz-practice')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }

  return (
    <div className="quiz-practice">
      <div className="quiz-practice__hero">
        <div>
          <p className="quiz-practice__eyebrow">静态模拟答题</p>
          <h2>小测整理练习</h2>
          <p>
            题库来自 5 份小测整理 Markdown，答案随页面静态打包，无后端计算。
            选择题和判断题可自动判分，填空题会按标准化文本比对并给出参考答案。
          </p>
        </div>
        <div className="quiz-practice__score">
          <span>{correctCount}</span>
          <small>/ {pageCheckedQuestions.length || pageQuestions.length}</small>
          <em>{pageCheckedQuestions.length ? '本页已判分' : '本页待作答'}</em>
        </div>
      </div>

      <div className="quiz-practice__toolbar">
        <label>
          来源
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="all">全部小测</option>
            {SOURCES.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          题型
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as FilterType)}
          >
            <option value="all">全部题型</option>
            <option value="fill">填空题</option>
            <option value="choice">选择题</option>
            <option value="judge">判断题</option>
          </select>
        </label>
        <button type="button" onClick={checkPage}>
          检查本页
        </button>
        <button type="button" className="quiz-practice__ghost" onClick={() => setShowAnswers((value) => !value)}>
          {showAnswers ? '隐藏本页答案' : '显示本页答案'}
        </button>
        <button type="button" className="quiz-practice__ghost" onClick={resetAll}>
          重置
        </button>
      </div>

      <div className="quiz-practice__summary">
        当前显示 {questions.length} 题：填空 {questions.filter((item) => item.type === 'fill').length}，
        选择 {questions.filter((item) => item.type === 'choice').length}，判断{' '}
        {questions.filter((item) => item.type === 'judge').length}。
        第 {currentPage} / {totalPages} 页，本页 {pageQuestions.length} 题。
      </div>

      <nav className="quiz-practice__pagination" aria-label="答题分页">
        <button
          type="button"
          className="quiz-practice__ghost"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          上一页
        </button>
        <div className="quiz-practice__page-list">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPage ? 'is-active' : 'quiz-practice__ghost'}
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="quiz-practice__ghost"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          下一页
        </button>
      </nav>

      <div className="quiz-practice__list">
        {pageQuestions.map((question, index) => {
          const current = answers[question.id] ?? defaultAnswer(question);
          const hasChecked = checked[question.id];
          const correct = isCorrect(question, current);

          return (
            <section
              key={question.id}
              className={`quiz-card ${hasChecked ? (correct ? 'quiz-card--correct' : 'quiz-card--wrong') : ''}`}
            >
              <div className="quiz-card__meta">
                <span>{pageStart + index + 1}</span>
                <span>{question.sourceTitle}</span>
                <span>{typeLabel(question.type)}</span>
              </div>
              <p className="quiz-card__question">{question.question}</p>

              {question.type === 'choice' && (
                <div className="quiz-card__options">
                  {question.options.map((option) => {
                    const key = option.slice(0, 1);
                    const selected = Array.isArray(current) && current.includes(key);
                    return (
                      <label key={option} className={selected ? 'quiz-card__option is-selected' : 'quiz-card__option'}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleChoice(question, key)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'judge' && (
                <div className="quiz-card__judge">
                  {['√', '×'].map((value) => (
                    <label key={value} className={current === value ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name={question.id}
                        checked={current === value}
                        onChange={() => setAnswer(question, value)}
                      />
                      <span>{value === '√' ? '正确' : '错误'}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'fill' && (
                <textarea
                  rows={2}
                  placeholder="输入你的答案；多空可用顿号、逗号或分号分隔"
                  value={String(current)}
                  onChange={(event) => setAnswer(question, event.target.value)}
                />
              )}

              <div className="quiz-card__actions">
                <button
                  type="button"
                  onClick={() => setChecked((value) => ({ ...value, [question.id]: true }))}
                >
                  检查本题
                </button>
                {hasChecked && (
                  <span className={correct ? 'quiz-card__result is-correct' : 'quiz-card__result is-wrong'}>
                    {correct ? '回答正确' : '需要复核'}
                  </span>
                )}
              </div>

              {(showAnswers || hasChecked) && (
                <div className="quiz-card__answer">
                  <strong>参考答案：</strong>
                  <span>{question.answer}</span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <nav className="quiz-practice__pagination quiz-practice__pagination--bottom" aria-label="答题分页">
        <button
          type="button"
          className="quiz-practice__ghost"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          上一页
        </button>
        <span>
          第 {currentPage} / {totalPages} 页
        </span>
        <button
          type="button"
          className="quiz-practice__ghost"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          下一页
        </button>
      </nav>
    </div>
  );
}
