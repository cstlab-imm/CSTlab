let blogPosts = [];
let currentCategory = 'all';

// DOM Elements
const postsContainer = document.getElementById('posts-container');

// Initialize Blog Data by fetching the JSON file
async function initBlog() {
    try {
        const response = await fetch('data/posts.json');
        if (response.ok) {
            blogPosts = await response.json();
            renderPosts();
            updateCategoryCounts();
        } else {
            console.error("Failed to load posts.json");
            if (postsContainer) {
                postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">載入文章失敗，請確認 data/posts.json 存在。</p>';
            }
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        if (postsContainer) {
            const isFileProtocol = window.location.protocol === 'file:';
            postsContainer.innerHTML = isFileProtocol 
                ? '<div style="text-align: center; color: var(--text-muted); padding: 2rem; line-height: 1.8;"><p style="font-weight: 600; color: var(--primary-color); margin-bottom: 0.5rem;">⚠️ 本地瀏覽器安全限制提醒</p><p>偵測到您直接以檔案路徑 (<code>file:///</code>) 開啟網頁，現代瀏覽器（Chrome/Edge）會阻擋本地讀取 JSON 資料。<br>請透過本地伺服器（例如 VS Code 的 <strong>Live Server</strong> 擴充套件）或上傳至伺服器環境開啟。</p></div>'
                : '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">載入文章發生錯誤，請確認網路連線或 data/posts.json 格式。</p>';
        }
    }
}

// Format markdown bold within content safely
function formatContent(text) {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Update counts in sidebar categories
function updateCategoryCounts() {
    const counts = {
        'all': blogPosts.length,
        '媒體報導': 0,
        '得獎紀錄': 0,
        '研究集錦': 0,
        '科普撰文': 0
    };

    blogPosts.forEach(post => {
        if (post.category && counts.hasOwnProperty(post.category)) {
            counts[post.category]++;
        }
    });

    for (const [cat, count] of Object.entries(counts)) {
        const countElem = document.getElementById(`count-${cat}`);
        if (countElem) {
            countElem.textContent = count;
        }
    }
}

// Render posts for public view
function renderPosts() {
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    if (blogPosts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">目前尚無文章發布。</p>';
        return;
    }

    // Sort posts by date descending
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedPosts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'blog-post-card';
        card.id = `post-${post.id}`;
        card.setAttribute('data-category', post.category || '');
        
        const excerptHtml = formatContent(post.excerpt || '');
        const hasFullContent = Boolean(post.content && post.content.trim());
        const formattedFullContent = hasFullContent ? formatContent(post.content) : '';

        const imageUrl = post.image || post.images;

        card.innerHTML = `
            ${imageUrl ? `
            <div class="blog-post-image-container">
                <img src="${imageUrl}" class="blog-post-image" alt="${post.title}">
            </div>` : ''}
            <div class="blog-post-content">
                ${post.category ? `<span class="blog-post-category-tag" onclick="selectCategoryByTag('${post.category}')"><i class="fas fa-tag"></i> ${post.category}</span>` : ''}
                <div class="blog-post-meta">
                    <span><i class="far fa-calendar"></i> ${post.date}</span>
                    <span><i class="far fa-user"></i> ${post.author || 'CST Lab'}</span>
                </div>
                <h3 class="blog-post-title">${post.title}</h3>
                ${excerptHtml ? `<div class="blog-post-excerpt">${excerptHtml}</div>` : ''}
                ${hasFullContent ? `
                <div class="blog-post-full" id="post-full-${post.id}">
                    <div class="blog-post-full-content">${formattedFullContent}</div>
                </div>
                <button class="btn btn-secondary btn-sm read-more-btn" id="btn-toggle-${post.id}" onclick="togglePost(${post.id})">
                    <span class="btn-text">閱讀更多</span> <i class="fas fa-chevron-down btn-icon"></i>
                </button>
                ` : ''}
            </div>
        `;
        postsContainer.appendChild(card);
    });
}

// Inline toggle full post
window.togglePost = function(id) {
    const fullContent = document.getElementById(`post-full-${id}`);
    const toggleBtn = document.getElementById(`btn-toggle-${id}`);
    if (!fullContent || !toggleBtn) return;

    const isExpanded = fullContent.classList.contains('expanded');
    
    if (isExpanded) {
        fullContent.classList.remove('expanded');
        toggleBtn.innerHTML = '<span class="btn-text">閱讀更多</span> <i class="fas fa-chevron-down btn-icon"></i>';
    } else {
        fullContent.classList.add('expanded');
        toggleBtn.innerHTML = '<span class="btn-text">收起內容</span> <i class="fas fa-chevron-up btn-icon"></i>';
    }
};

// Select category from sidebar click
window.selectCategory = function(category, element) {
    currentCategory = category;

    // Update active class in sidebar
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });

    if (element) {
        element.classList.add('active');
    } else {
        const targetItem = document.querySelector(`.category-item[data-category="${category}"]`);
        if (targetItem) targetItem.classList.add('active');
    }

    filterPosts();
};

// Select category by clicking badge on post card
window.selectCategoryByTag = function(category) {
    window.selectCategory(category, null);
};

// Unified filter logic (Category + Search Query)
window.filterPosts = function() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('.blog-post-card');
    let matchCount = 0;

    cards.forEach(card => {
        const postCategory = card.getAttribute('data-category') || '';
        const title = card.querySelector('.blog-post-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.blog-post-excerpt')?.textContent.toLowerCase() || '';
        const fullContent = card.querySelector('.blog-post-full-content')?.textContent.toLowerCase() || '';
        const author = card.querySelector('.blog-post-meta')?.textContent.toLowerCase() || '';

        // Check Category Match
        const categoryMatch = (currentCategory === 'all') || (postCategory === currentCategory);

        // Check Search Query Match
        const searchMatch = !query || 
            title.includes(query) || 
            excerpt.includes(query) || 
            fullContent.includes(query) || 
            author.includes(query) ||
            postCategory.toLowerCase().includes(query);

        if (categoryMatch && searchMatch) {
            card.style.display = 'block';
            matchCount++;
        } else {
            card.style.display = 'none';
        }
    });

    let noResultMsg = document.getElementById('no-search-results');
    if (matchCount === 0 && cards.length > 0) {
        if (!noResultMsg && postsContainer) {
            noResultMsg = document.createElement('p');
            noResultMsg.id = 'no-search-results';
            noResultMsg.style.textAlign = 'center';
            noResultMsg.style.color = 'var(--text-muted)';
            noResultMsg.style.padding = '3rem 1rem';
            noResultMsg.innerHTML = '<i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 0.75rem; color: var(--border-color); display: block;"></i>目前此分類或搜尋條件下尚無相關文章。';
            postsContainer.appendChild(noResultMsg);
        }
    } else if (noResultMsg) {
        noResultMsg.remove();
    }
};

// Run Init
document.addEventListener('DOMContentLoaded', initBlog);
