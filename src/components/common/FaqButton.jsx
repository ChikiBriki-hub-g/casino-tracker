import React, { useState } from "react";
import { CircleHelp, X } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Что показывает раздел «Финансы»?",
    answer:
      "Здесь ведутся депозиты и выводы, чтобы видеть общий результат по банку.",
  },
  {
    question: "Как работает раздел «Слоты»?",
    answer:
      "Вы добавляете игровые записи по слотам: ставка, спины, бонусы и итоговый баланс. Из этих записей строится аналитика.",
  },
  {
    question: "Что такое быстрая запись?",
    answer:
      "После сохранения форма оставляет слот, провайдера и ставку, чтобы удобно вносить похожие записи подряд.",
  },
  {
    question: "Что смотреть в аналитике в первую очередь?",
    answer:
      "Итог за период, лучший слот, главный провайдер и график изменения баланса. Остальное уже для более глубокого разбора.",
  },
  {
    question: "Что есть в настройках?",
    answer:
      "Там собраны настройки приложения, экспорт данных, сброс данных и поведение записи, чтобы не дублировать это по другим экранам.",
  },
];

export default function FaqButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="faq-fab fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-3 text-sm font-semibold text-slate-200 shadow-2xl shadow-slate-950/30 backdrop-blur-md transition-colors hover:border-slate-600 hover:text-white"
      >
        <CircleHelp size={18} />
        FAQ
      </button>

      {isOpen && (
        <div className="faq-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="faq-modal surface-card flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t sm:h-auto sm:max-h-[720px] sm:rounded-2xl sm:border">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">FAQ</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Короткие ответы по основным разделам приложения.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="surface-card-muted overflow-hidden p-0"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-200">
                    {item.question}
                  </summary>
                  <div className="border-t border-slate-800 px-4 py-3 text-sm leading-6 text-slate-400">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
