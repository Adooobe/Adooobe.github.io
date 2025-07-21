// 侧边栏交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle .toggle-btn');
    const categorySelect = document.getElementById('categorySelect');
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    // 移动端侧边栏切换
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            toggleBtn.classList.toggle('active');
            
            // 防止背景滚动
            if (sidebar.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // 下拉框选择事件
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedValue = this.value;
            if (selectedValue) {
                window.location.href = selectedValue;
            }
        });
        
        // 设置当前选中的分类
        const currentPath = window.location.pathname;
        const options = categorySelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value && currentPath.includes(options[i].value)) {
                categorySelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // 分类展开/折叠功能
    categoryHeaders.forEach(function(header) {
        const categoryPosts = header.nextElementSibling;
        
        // 默认展开所有分类
        header.classList.add('expanded');
        categoryPosts.style.display = 'block';
        categoryPosts.classList.add('expanded');
        
        header.addEventListener('click', function() {
            const isExpanded = this.classList.contains('expanded');
            
            // 切换展开状态
            this.classList.toggle('expanded');
            
            if (isExpanded) {
                // 折叠
                categoryPosts.classList.remove('expanded');
                setTimeout(function() {
                    categoryPosts.style.display = 'none';
                }, 300);
            } else {
                // 展开
                categoryPosts.style.display = 'block';
                setTimeout(function() {
                    categoryPosts.classList.add('expanded');
                }, 10);
            }
        });
    });
    
    // 点击侧边栏外部关闭
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('show');
                toggleBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // 窗口大小改变时重置
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
            toggleBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // 高亮当前分类
    const currentPath = window.location.pathname;
    const categoryLinks = document.querySelectorAll('.category-list a');
    
    categoryLinks.forEach(function(link) {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath) && linkPath !== '/') {
            link.classList.add('current');
        }
    });
    
    // 添加平滑滚动效果
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 侧边栏滚动优化
    if (sidebar) {
        let isScrolling = false;
        sidebar.addEventListener('scroll', function() {
            if (!isScrolling) {
                window.requestAnimationFrame(function() {
                    // 可以在这里添加滚动时的效果
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });
    }
    
    // 为categories列表项添加点击反馈
    const categoryItems = document.querySelectorAll('.category-list a');
    categoryItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 在移动端点击后关闭侧边栏
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    sidebar.classList.remove('show');
                    if (toggleBtn) {
                        toggleBtn.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }, 200);
            }
        });
    });
}); 