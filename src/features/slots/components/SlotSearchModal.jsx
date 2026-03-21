import React from "react";
import { PlusCircle, Search, Star, X } from "lucide-react";

export default function SlotSearchModal({ slots }) {
  const totalVisibleResults = slots.slotSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  const renderSlotOption = (slot) => {
    const isFavorite = slots.favoriteSlotSet.has(slot.toLowerCase());
    const provider = slots.providerBySlot.get(slot.toLowerCase()) || "";

    return (
      <div
        key={slot}
        className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-950/20 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
      >
        <button
          type="button"
          onClick={() => slots.handleSelectSlot(slot)}
          className="flex-1 px-4 py-3.5 text-left"
        >
          <div className="text-sm font-semibold text-slate-100">{slot}</div>
          {provider && (
            <div className="mt-1 text-[11px] text-slate-500">{provider}</div>
          )}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            slots.handleToggleFavoriteSlot(slot);
          }}
          className="mr-2 rounded-lg p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-700 transition-colors"
          aria-label={
            isFavorite
              ? `Убрать ${slot} из избранного`
              : `Добавить ${slot} в избранное`
          }
          title={isFavorite ? "Убрать из избранного" : "В избранное"}
        >
          <Star
            size={18}
            className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
          />
        </button>
      </div>
    );
  };

  const renderSlotSection = (section) => {
    const showEmptyState =
      !slots.normalizedSlotSearchQuery &&
      section.id !== "popular" &&
      section.items.length === 0;

    if (section.items.length === 0 && !showEmptyState) {
      return null;
    }

    return (
      <section key={section.id} className="space-y-2">
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {section.title}
          </p>
          {section.items.length > 0 && (
            <span className="text-[10px] text-slate-600">
              {section.items.length}
            </span>
          )}
        </div>
        <div className="space-y-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 p-2">
          {section.items.length > 0 ? (
            section.items.map(renderSlotOption)
          ) : (
            <div className="px-4 py-4 text-sm text-slate-500">
              {section.emptyText}
            </div>
          )}
        </div>
      </section>
    );
  };

  if (!slots.isSlotSearchOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={slots.closeSlotSearch}
    >
      <div
        className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl h-[80vh] sm:h-[600px] flex flex-col animate-in slide-in-from-bottom-full sm:fade-in sm:slide-in-from-bottom-0 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Выбор слота
              </p>
            </div>
            <button
              onClick={slots.closeSlotSearch}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              autoFocus
              value={slots.slotSearchQuery}
              onChange={(event) => slots.setSlotSearchQuery(event.target.value)}
              placeholder="Начните вводить название слота"
              className="w-full border-none bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            {slots.slotSearchQuery && (
              <button
                type="button"
                onClick={() => slots.setSlotSearchQuery("")}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
                aria-label="Очистить поиск"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {slots.normalizedSlotSearchQuery
                ? `Найдено: ${totalVisibleResults}`
                : "Сначала показаны недавние, избранные и ваши слоты"}
            </span>
            {slots.favoriteSlots.length > 0 && (
              <span>Избранных: {slots.favoriteSlots.length}</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide space-y-4">
          {slots.normalizedSlotSearchQuery && !slots.hasExactSlotMatch && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-200 text-sm font-semibold">
                <PlusCircle size={18} />
                Добавить слот "{slots.normalizedSlotSearchQuery}"
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-indigo-200/80">
                  Провайдер слота
                </label>
                <input
                  type="text"
                  list="provider-options-modal"
                  value={slots.newSlotProvider}
                  onChange={(event) =>
                    slots.setNewSlotProvider(event.target.value)
                  }
                  className="w-full bg-slate-950/70 border border-indigo-400/30 rounded-xl px-3 py-2 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  placeholder="Выберите или введите нового провайдера"
                />
                <datalist id="provider-options-modal">
                  {slots.providerOptions.map((provider) => (
                    <option key={`modal-${provider}`} value={provider} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                onClick={slots.handleAddCustomSlot}
                className="w-full rounded-xl bg-indigo-600/30 px-3 py-3 text-sm font-semibold text-indigo-100 transition-colors hover:bg-indigo-600/40"
              >
                Добавить в мои слоты
              </button>
            </div>
          )}

          {slots.slotSections.some(
            (section) =>
              section.items.length > 0 ||
              (!slots.normalizedSlotSearchQuery &&
                section.id !== "popular" &&
                section.items.length === 0),
          ) ? (
            slots.slotSections.map(renderSlotSection)
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-slate-300 font-semibold">
                Ничего не найдено
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
