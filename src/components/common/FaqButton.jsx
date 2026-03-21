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
    question: "Что такое сессия в слотах?",
    answer:
      "Сессия объединяет несколько записей в один игровой заход. Это удобно, если вы играли подряд и хотите видеть результат не по одной записи, а по целой серии.",
  },
  {
    question: "Что записывать в слотах?",
    answer:
      "Обычно достаточно указать слот, ставку, количество спинов, число бонусов и итоговый баланс. Этого хватает, чтобы приложение считало статистику и динамику.",
  },
  {
    question: "Зачем нужен провайдер у слота?",
    answer:
      "Провайдер помогает группировать результаты по студиям игр. Это полезно в аналитике, если хотите понять, у каких провайдеров у вас чаще игра или лучше результат.",
  },
  {
    question: "Что такое быстрая запись?",
    answer:
      "После сохранения форма оставляет слот, провайдера и ставку, чтобы удобно вносить похожие записи подряд.",
  },
  {
    question: "Что такое избранные и мои слоты?",
    answer:
      "Избранные нужны для быстрого доступа к слотам, которые вы используете часто. Мои слоты позволяют добавить игру вручную, если её не оказалось в каталоге поиска.",
  },
  {
    question: "Что смотреть в аналитике в первую очередь?",
    answer:
      "Итог за период, лучший слот, главный провайдер и график изменения баланса. Остальное уже для более глубокого разбора.",
  },
  {
    question: "Что означает итог за период?",
    answer:
      "Это общий результат по выбранному отрезку времени. Если значение положительное, период вышел в плюс. Если отрицательное, в минус.",
  },
  {
    question: "Что означает лучший слот?",
    answer:
      "Это слот, который дал лучший суммарный результат в выбранном периоде. Он не обязательно самый часто играемый, а именно самый удачный по итогу.",
  },
  {
    question: "Что означает главный провайдер?",
    answer:
      "Это провайдер, у которого у вас было больше всего сессий или объёма игры в выбранном фильтре. По нему удобно видеть, где проходит основная часть игры.",
  },
  {
    question: "Зачем нужен простой и продвинутый режим аналитики?",
    answer:
      "Простой режим оставляет только главное: итог, ключевые показатели и график. Продвинутый открывает сравнение периодов, подробные таблицы и более глубокую статистику.",
  },
  {
    question: "Что есть в настройках?",
    answer:
      "Там собраны тема приложения, валюта, быстрая запись слотов, экспорт данных и полный сброс. Настройки специально вынесены в одно место без дублирования по экранам.",
  },
  {
    question: "Как работает экспорт данных?",
    answer:
      "Экспорт сохраняет ваши финансы, слот-сессии, пользовательские слоты и настройки в JSON-файл. Его можно держать как резервную копию.",
  },
  {
    question: "Что делает сброс данных?",
    answer:
      "Сброс удаляет все операции, записи по слотам, пользовательские данные и возвращает приложение в исходное состояние. Перед этим лучше сделать экспорт.",
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
        <div
          className="faq-overlay fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="faq-modal surface-card flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t sm:h-auto sm:max-h-[720px] sm:rounded-2xl sm:border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">FAQ</h2>
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
