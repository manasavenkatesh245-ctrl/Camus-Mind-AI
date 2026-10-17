import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Loader2,
  FileText
} from 'lucide-react';
import { Quiz, QuizSubmissionResult, DocumentItem } from '../types';
import { generateQuiz, submitQuizAnswers, fetchQuizList, fetchQuiz } from '../api';

interface QuizViewProps {
  documents: DocumentItem[];
  onLoadSample: () => Promise<void>;
  loadingSample: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  documents,
  onLoadSample,
  loadingSample,
}) => {
  // Mode: 'create' | 'taking' | 'result'
  const [mode, setMode] = useState<'create' | 'taking' | 'result'>('create');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [topic, setTopic] = useState('Academic Policies & Attendance Regulations');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);

  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPastQuizzes();
  }, []);

  const loadPastQuizzes = async () => {
    try {
      const list = await fetchQuizList();
      setQuizHistory(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      alert('Please upload a document or load the demo handbook first.');
      return;
    }

    try {
      setGenerating(true);
      const quiz = await generateQuiz(topic, difficulty, questionCount, selectedDocId);
      setActiveQuiz(quiz);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setMode('taking');
      loadPastQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < activeQuiz.questions.length) {
      const confirmIncomplete = window.confirm(
        `You have answered ${answeredCount} of ${activeQuiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmIncomplete) return;
    }

    try {
      setSubmitting(true);
      const result = await submitQuizAnswers(activeQuiz.id, userAnswers);
      setSubmissionResult(result);
      setMode('result');
      loadPastQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumePastQuiz = async (quizId: string) => {
    try {
      setGenerating(true);
      const quiz = await fetchQuiz(quizId);
      setActiveQuiz(quiz);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setMode('taking');
    } catch (e: any) {
      alert('Failed to load past quiz');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* ---------------- MODE: CREATE QUIZ ---------------- */}
      {mode === 'create' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <span>AI Quiz Studio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Generate grounded multiple-choice tests from your institutional documents to assess knowledge retention.
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">No documents available for quiz creation</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Load the demo handbook or upload your syllabus to generate grounded quizzes.
                </p>
              </div>
              <button
                onClick={onLoadSample}
                disabled={loadingSample}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                {loadingSample ? 'Loading Demo Handbook...' : 'Load Demo Handbook'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quiz Configuration Form */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  Configure New Quiz
                </h3>

                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Source Document
                    </label>
                    <select
                      value={selectedDocId || ''}
                      onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">All Uploaded Documents ({documents.length})</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title} ({d.page_count} pages)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Topic or Regulation Focus
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Academic Attendance, Tuition Fees, Honor Code"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1.5">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="easy">Easy (Direct recall)</option>
                        <option value="medium">Medium (Policy rules)</option>
                        <option value="hard">Hard (Detailed edge-cases)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1.5">
                        Question Count
                      </label>
                      <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value={3}>3 Questions (Quick check)</option>
                        <option value={5}>5 Questions (Standard)</option>
                        <option value={10}>10 Questions (Comprehensive)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting Key Policies & Building MCQs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate & Start Quiz</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Past Quizzes History */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-4">
                  Past Quizzes ({quizHistory.length})
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[320px]">
                  {quizHistory.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      No quizzes taken yet. Create one to test your knowledge!
                    </div>
                  ) : (
                    quizHistory.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-200 truncate">{q.topic}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-400">
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{q.question_count} questions</span>
                          <button
                            onClick={() => handleResumePastQuiz(q.id)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            Retake
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODE: TAKING QUIZ ---------------- */}
      {mode === 'taking' && activeQuiz && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Quiz Top bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 block">
                {activeQuiz.topic} • {activeQuiz.difficulty.toUpperCase()}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{activeQuiz.title}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-300">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <div className="text-[11px] text-slate-400">
                {Object.keys(userAnswers).length} answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ = activeQuiz.questions[currentQuestionIndex];
            const selectedOpt = userAnswers[currentQ.id];

            return (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-indigo-400">
                    Question #{currentQuestionIndex + 1}
                  </span>
                  <h4 className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
                    {currentQ.question}
                  </h4>
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 border ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-slate-100 shadow-md ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {letter}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stepper controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Grading...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit & View Results</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------- MODE: RESULT & REVIEW ---------------- */}
      {mode === 'result' && submissionResult && activeQuiz && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Score Header Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/40 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
              submissionResult.passed
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}>
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Quiz Score Report
              </span>
              <h3 className="text-3xl font-extrabold text-white">
                {submissionResult.score} / {submissionResult.total_questions} ({submissionResult.percentage}%)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                {submissionResult.feedback}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setMode('create')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Create Another Quiz
              </button>
              <button
                onClick={() => {
                  setUserAnswers({});
                  setCurrentQuestionIndex(0);
                  setMode('taking');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake This Quiz</span>
              </button>
            </div>
          </div>

          {/* Detailed Question-by-Question Review */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Detailed Question Review & Policy Citations
            </h4>

            {submissionResult.results.map((res, idx) => (
              <div
                key={res.question_id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  res.is_correct
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900/60 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {res.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">Question #{idx + 1}</span>
                      <h5 className="text-xs sm:text-sm font-semibold text-slate-200">
                        {res.question}
                      </h5>
                    </div>
                  </div>

                  {res.page_reference && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30 shrink-0">
                      Page {res.page_reference}
                    </span>
                  )}
                </div>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {res.options.map((opt, oIdx) => {
                    const isCorrectChoice = oIdx === res.correct_index;
                    const isUserChoice = oIdx === res.selected_index;

                    let badgeColor = 'bg-slate-950/40 text-slate-400 border-slate-800';
                    if (isCorrectChoice) {
                      badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 font-semibold';
                    } else if (isUserChoice && !res.is_correct) {
                      badgeColor = 'bg-rose-950/40 text-rose-300 border-rose-500/40 line-through';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${badgeColor}`}
                      >
                        <span>{opt}</span>
                        {isCorrectChoice && <span className="text-[10px] text-emerald-400">✓ Correct</span>}
                        {isUserChoice && !isCorrectChoice && <span className="text-[10px] text-rose-400">✗ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-200 block mb-1">Policy Rationale:</span>
                  <p className="leading-relaxed">{res.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
