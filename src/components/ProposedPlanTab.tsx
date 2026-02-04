"use client";

const CITY_COLORS = {
  London: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "bg-blue-500",
  },
  Paris: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-900",
    accent: "bg-pink-500",
  },
  Amsterdam: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    accent: "bg-orange-500",
  },
};

export default function ProposedPlanTab() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Info Banner */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-900 text-sm sm:text-base mb-1">Proposed Trip Plan (Draft)</h3>
            <p className="text-amber-800 text-xs sm:text-sm">
              Nothing here is locked yet — it's a suggested plan to help us converge.
            </p>
          </div>
        </div>
      </div>

      {/* Trip Window */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Trip Window</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Dates:</span>
            <span className="text-gray-900">Jun 26 – Jul 5, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Base city:</span>
            <span className="text-gray-900">London at the start and end</span>
          </div>
        </div>
      </div>

      {/* Key Facts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Key Facts / Constraints</h2>
        <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
          <li>Most people start in London Jun 26/27 and end in London Jul 5.</li>
          <li>Kachi starts in Amsterdam Jun 27 – Jun 29, then travels to London.</li>
          <li>Paris should be a short trip: 1–2 days, ideally only 1 hotel night (in-and-out).</li>
          <li>London date-constrained events: Wimbledon + Henley Royal Regatta (London anchors).</li>
        </ul>
      </div>

      {/* High-level Phases */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">High-level Phases</h2>
        <div className="space-y-4 sm:space-y-6">
          {/* Phase 1 */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.London.bg} ${CITY_COLORS.London.border}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${CITY_COLORS.London.accent} flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Phase 1 — London Base (Arrivals + settle)</h3>
                <div className="space-y-1 text-sm sm:text-base text-gray-700">
                  <div><span className="font-semibold">London:</span> Jun 26 – Jul 1</div>
                  <div className="text-xs sm:text-sm text-gray-600 italic">Note: Kachi is in Amsterdam Jun 27–29 then joins London</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.Paris.bg} ${CITY_COLORS.Paris.border}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${CITY_COLORS.Paris.accent} flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Phase 2 — Optional Side Trips</h3>
                <div className="space-y-1 text-sm sm:text-base text-gray-700">
                  <div><span className="font-semibold">Paris (optional):</span> Jul 2 – Jul 3 (1 night)</div>
                  <div className="text-xs sm:text-sm text-gray-600 italic">Goal: in-and-out, minimal hotel nights</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.London.bg} ${CITY_COLORS.London.border}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${CITY_COLORS.London.accent} flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Phase 3 — Final London Days</h3>
                <div className="space-y-1 text-sm sm:text-base text-gray-700">
                  <div><span className="font-semibold">London:</span> Jul 3 – Jul 5</div>
                  <div className="text-xs sm:text-sm text-gray-600 italic">Anchor vibe: Henley/Wimbledon window + departures</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">City Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* London */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.London.bg} ${CITY_COLORS.London.border}`}>
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3">London</h3>
            <p className="text-sm sm:text-base text-gray-700">
              Default city if not doing side trips
            </p>
          </div>

          {/* Amsterdam */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.Amsterdam.bg} ${CITY_COLORS.Amsterdam.border}`}>
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3">Amsterdam</h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              <div><span className="font-semibold">Dates:</span> Jun 27–29</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Kachi confirmed; suggested that Jake may join based on his preference
              </div>
            </div>
          </div>

          {/* Paris */}
          <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.Paris.bg} ${CITY_COLORS.Paris.border}`}>
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3">Paris</h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-700">
              <div><span className="font-semibold">Dates:</span> Jul 2–3</div>
              <div className="text-xs sm:text-sm text-gray-600">
                Karim + Adam want to go; Lucas is flexible; Kachi may join depending on timing; others can stay in London
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* People Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">People Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Karim */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Karim</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 2; Paris Jul 2–Jul 3; London Jul 3–Jul 5
            </p>
          </div>

          {/* Adam */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Adam</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 2; Paris Jul 2–Jul 3; London Jul 3–Jul 5
            </p>
          </div>

          {/* Kachi */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Kachi</h3>
            <p className="text-sm sm:text-base text-gray-700">
              Amsterdam Jun 27–Jun 29; London Jun 29–Jul 5; Paris optional Jul 2–Jul 3
            </p>
          </div>

          {/* Jake */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Jake</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 5 (optional Amsterdam Jun 27–Jun 29)
            </p>
          </div>

          {/* Lucas */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Lucas</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 5 (optional Paris Jul 2–Jul 3)
            </p>
          </div>

          {/* Justin */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Justin</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 5
            </p>
          </div>

          {/* Andrew */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Andrew</h3>
            <p className="text-sm sm:text-base text-gray-700">
              London Jun 26–Jul 5
            </p>
          </div>

          {/* Daunte */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Daunte</h3>
            <p className="text-sm sm:text-base text-gray-700 italic">
              Tentative — if he comes, default London Jun 26–Jul 5
            </p>
          </div>
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Next step</h3>
        <p className="text-sm sm:text-base text-gray-700">
          Reply in the group chat with which option you want: <span className="font-semibold">London only</span> / <span className="font-semibold">London+Amsterdam</span> / <span className="font-semibold">London+Paris</span> / <span className="font-semibold">All three</span>.
        </p>
      </div>
    </div>
  );
}

