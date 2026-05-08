<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <button @click="$router.back()" class="mb-4 text-sm text-stone-500 hover:text-red-900 transition bg-transparent border-0 cursor-pointer">
      ← 返回
    </button>

    <div class="text-center mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-red-900 mb-2">红色知识大闯关</h1>
      <p class="text-sm text-stone-500">以赛促学，在闯关中铭记红色历史</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 英烈知识百题斩 -->
      <router-link to="/game/quiz" class="group no-underline">
        <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 hover:border-red-900 hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
          <div class="bg-gradient-to-r from-red-900 to-red-800 text-white p-6 text-center">
            <div class="text-5xl mb-3">⚡</div>
            <h2 class="text-xl font-bold">英烈知识百题斩</h2>
          </div>
          <div class="p-5">
            <p class="text-sm text-stone-600 mb-4 leading-relaxed">
              从红色题库随机抽题，答对继续，答错即止。挑战你的连续答对记录，冲击排行榜！
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-red-50 text-red-900 text-xs rounded-full">无尽模式</span>
              <span class="px-2 py-1 bg-red-50 text-red-900 text-xs rounded-full">排行榜</span>
              <span class="px-2 py-1 bg-red-50 text-red-900 text-xs rounded-full">后端校验</span>
            </div>
          </div>
        </div>
      </router-link>

      <!-- 红色记忆翻翻看 -->
      <router-link to="/game/memory" class="group no-underline">
        <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 hover:border-red-900 hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
          <div class="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-6 text-center">
            <div class="text-5xl mb-3">🃏</div>
            <h2 class="text-xl font-bold">红色记忆翻翻看</h2>
          </div>
          <div class="p-5">
            <p class="text-sm text-stone-600 mb-4 leading-relaxed">
              翻牌配对英烈与事迹，锻炼记忆力的同时学习红色历史。用最少步数完成挑战！
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">记忆配对</span>
              <span class="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">计时挑战</span>
              <span class="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">趣味学习</span>
            </div>
          </div>
        </div>
      </router-link>

      <!-- 抉择时刻 -->
      <router-link to="/game/choice" class="group no-underline">
        <div class="bg-white rounded-2xl shadow-lg border-2 border-amber-700/20 hover:border-red-900 hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
          <div class="bg-gradient-to-r from-stone-800 to-red-950 text-white p-6 text-center">
            <div class="text-5xl mb-3">⚖️</div>
            <h2 class="text-xl font-bold">抉择时刻</h2>
          </div>
          <div class="p-5">
            <p class="text-sm text-stone-600 mb-4 leading-relaxed">
              走进英烈牺牲前的关键历史瞬间，多步剧情抉择。正确选项与史实一致；错误时需写下思考，并完成红色教育闭环。
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-stone-100 text-stone-800 text-xs rounded-full">沉浸剧情</span>
              <span class="px-2 py-1 bg-stone-100 text-stone-800 text-xs rounded-full">31 位英烈</span>
              <span class="px-2 py-1 bg-stone-100 text-stone-800 text-xs rounded-full">历史结局</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
