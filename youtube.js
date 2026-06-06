// ⚠️ 請填入妳的 YouTube API 金鑰
const API_KEY = 'AIzaSyAGt0EesNbdwe4uOLSAsm0YKR8pji04Hs0';

// 備用模擬資料（測試用）
const mockData = [
    { id: '1', title: 'Loading Channel...', category: 'MUSIC', videoId: 'dQw4w9WgXcQ', views: '999,999' },
    { id: '2', title: 'Loading Channel...', category: 'GAMING', videoId: 'dQw4w9WgXcQ', views: '888,888' },
    { id: '3', title: 'Loading Channel...', category: 'ENT', videoId: 'dQw4w9WgXcQ', views: '777,777' }
];

let currentCategory = 'ALL';
let searchQuery = '';

// 安全的初始化監聽
document.addEventListener("DOMContentLoaded", function() {
    initButtons();
    renderRanklist(mockData); 
    // fetchYouTubeData(); // 妳原本的 API 抓取邏輯可以放這
});

function initButtons() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => {
                b.classList.remove('bg-red-600', 'text-white');
                b.classList.add('bg-gray-800', 'text-slate-400');
            });
            this.classList.remove('bg-gray-800', 'text-slate-400');
            this.classList.add('bg-red-600', 'text-white');

            currentCategory = this.getAttribute('data-category');
            filterAndRender();
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.toLowerCase();
            filterAndRender();
        });
    }
}

function filterAndRender() {
    const filtered = mockData.filter(item => {
        const matchesCategory = (currentCategory === 'ALL' || item.category === currentCategory);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    renderRanklist(filtered);
}

function renderRanklist(data) {
    const container = document.getElementById('ranklist-container');
    const placeholder = document.getElementById('loading-placeholder');
    
    if (placeholder) placeholder.remove();
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-mono">查無相關頻道資料</div>`;
        return;
    }

    container.innerHTML = data.map((item, index) => `
        <div class="bg-gray-900/20 border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition shadow-xl group">
            <div class="p-5 flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">RANK #0${index + 1}</span>
                    <span class="text-[10px] font-mono text-slate-500">${item.category}</span>
                </div>
                <div class="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5">
                    <iframe class="w-full h-full" src="https://www.youtube.com/embed/${item.videoId}" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="flex items-center justify-between mt-2">
                    <h3 class="font-bold text-sm text-slate-200 truncate w-40">${item.title}</h3>
                    <div class="text-right">
                        <p class="text-[10px] font-mono text-slate-500">VIEWS</p>
                        <p class="font-mono text-xs font-bold text-slate-300">${item.views}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
