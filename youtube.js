// ⚠️ 請在這裡貼上妳從 Google 申請到的真實 API 金鑰
const API_KEY = 'AIzaSyAGt0EesNbdwe4uOLSAsm0YKR8pji04Hs0';

// 排行榜頻道的清單（請換成妳正式要觀察的 YouTube 頻道 ID）
const CHANNELS = [
    { id: 'UC4R8627576_Example1', category: 'MUSIC' },
    { id: 'UC4R8627576_Example2', category: 'GAMING' },
    { id: 'UC4R8627576_Example3', category: 'ENT' }
];

let ranklistData = []; // 儲存從 API 抓下來的正式資料
let currentCategory = 'ALL';
let searchQuery = '';

// 💡 機關一：等網頁 HTML 蓋好，立刻啟動
document.addEventListener("DOMContentLoaded", function() {
    console.log("🔥 系統核心啟動：正式版 YouTube 排行榜初始化...");
    
    initButtons();      // 啟用分類與搜尋按鈕
    fetchYouTubeData(); // 正式向 Google 抓取資料
});

// 💡 機關二：向 YouTube 伺服器要最新的真實資料
async function fetchYouTubeData() {
    const container = document.getElementById('ranklist-container');
    
    try {
        // 如果沒有填 API Key，直接自爆提醒
        if (API_KEY.includes('請填入')) {
            throw new Error("API_KEY 未設定，請檢查 youtube.js 第一行！");
        }

        const idString = CHANNELS.map(c => c.id).join(',');
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${idString}&key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error("無法從 YouTube API 取得任何資料，請檢查頻道 ID 或金鑰。");
        }

        // 把抓到的真實資料組合起來
        ranklistData = data.items.map(item => {
            const config = CHANNELS.find(c => c.id === item.id);
            return {
                id: item.id,
                title: item.snippet.title,
                avatar: item.snippet.thumbnails.default.url,
                // 精準抓取觀看次數，轉成千分位數字字串
                views: parseInt(item.statistics.viewCount).toLocaleString(),
                category: config ? config.category : 'ALL',
                // 這裡通常會綁定該頻道最新一支影片，或是預設精選影片
                videoId: 'dQw4w9WgXcQ' 
            };
        });

        // 依據觀看次數由大到小排序（真正的排行榜！）
        ranklistData.sort((a, b) => {
            return parseInt(b.views.replace(/,/g, '')) - parseInt(a.views.replace(/,/g, ''));
        });

        // 渲染畫面
        filterAndRender();

    } catch (error) {
        console.error("❌ 撈取資料失敗:", error);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-red-500 font-cyber text-xs">
                    [SYSTEM ERROR]: DATABASE SYNC FAILED<br>
                    <span class="text-slate-500 text-[10px] mt-2 block">${error.message}</span>
                </div>`;
        }
    }
}

// 💡 機關三：按鈕事件監聽（完美對應妳的 ALL, MUSIC, GAMING, ENT 按鈕）
function initButtons() {
    // 抓取妳網頁上那四個分類按鈕
    const buttons = document.querySelectorAll('main button');
    
    buttons.forEach(btn => {
        // 幫每個按鈕加上點擊功能
        btn.addEventListener('click', function() {
            const text = this.innerText.trim().toUpperCase();
            
            // 如果點的是 HOT 或 VS ARENA 就跳過不處理
            if (text === 'HOT' || text === 'VS ARENA' || text === 'TW ▾') return;

            // 切換按鈕的高亮視覺效果
            buttons.forEach(b => {
                if (b.innerText.trim().toUpperCase() !== 'HOT' && b.innerText.trim().toUpperCase() !== 'VS ARENA') {
                    b.className = "px-4 py-2 rounded-lg bg-gray-800 text-slate-400 hover:bg-gray-700 hover:text-white transition-all";
                }
            });
            this.className = "px-4 py-2 rounded-lg bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all";

            currentCategory = text;
            filterAndRender();
        });
    });

    // 搜尋框監聽
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.toLowerCase();
            filterAndRender();
        });
    }
}

// 💡 機關四：過濾資料並畫出賽博朋克卡片
function filterAndRender() {
    const filtered = ranklistData.filter(item => {
        const matchesCategory = (currentCategory === 'ALL' || item.category === currentCategory);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    renderRanklist(filtered);
}

function renderRanklist(data) {
    const container = document.getElementById('ranklist-container');
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-cyber text-xs">// NO CHANNELS FOUND IN THIS CATEGORY</div>`;
        return;
    }

    // 動態把真實資料塞進妳最愛的賽博朋克外殼裡！
    container.innerHTML = data.map((item, index) => `
        <div class="cyber-card p-5 rounded-2xl border border-white/5 hover:border-red-500/40 transition-all duration-300 group relative overflow-hidden">
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-cyber text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-black tracking-wider">RANK #0${index + 1}</span>
                    <span class="text-[9px] font-cyber text-slate-500 font-black tracking-widest">${item.category}</span>
                </div>
                
                <div class="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5">
                    <iframe class="w-full h-full" src="https://www.youtube.com/embed/${item.videoId}" frameborder="0" allowfullscreen></iframe>
                </div>

                <div class="flex items-center justify-between mt-1">
                    <div class="flex items-center gap-2.5 truncate w-40">
                        <img src="${item.avatar}" class="w-6 h-6 rounded-full border border-white/10" onerror="this.src='https://ui-avatars.com/api/?name=YT'">
                        <h3 class="font-bold text-xs text-slate-200 group-hover:text-red-400 transition truncate">${item.title}</h3>
                    </div>
                    <div class="text-right">
                        <p class="text-[8px] font-cyber text-slate-500 font-black tracking-widest">TOTAL VIEWS</p>
                        <p class="font-cyber text-xs font-black text-amber-400 tracking-tighter">${item.views}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
