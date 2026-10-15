document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Set active nav item based on current URL path
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Check if path matches or if it's index/root
        if (currentPath.endsWith(href) || (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
            link.parentElement.classList.add('active');
        } else {
            link.parentElement.classList.remove('active');
        }
    });

    // Research Topic Circle Navigation
    const topicNavItems = document.querySelectorAll('.topic-circle-item');

    if (topicNavItems.length > 0) {
        // Smooth click handler
        topicNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const targetElem = document.querySelector(targetId);
                    if (targetElem) {
                        e.preventDefault();
                        targetElem.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
    // =======================================
    // 圖片點擊放大 (Lightbox Modal)
    // =======================================
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalClose = document.getElementById('modal-close');
    const topicImages = document.querySelectorAll('.topic-image');

    if (modal && modalImg && topicImages.length > 0) {
        // 點擊任意文章配圖時開啟
        topicImages.forEach(img => {
            img.addEventListener('click', () => {
                modalImg.src = img.src;
                modalCaption.textContent = img.alt || '';
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // 鎖定背景頁面滾動
            });
        });

        // 關閉燈箱函式
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // 恢復背景滾動
        };

        // 1. 點擊右上角 X 關閉
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        // 2. 點擊圖片外部黑色背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // 3. 按鍵盤 ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

});
