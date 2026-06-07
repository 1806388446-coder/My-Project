/* ==========================================================================
   💑 我们的专属回忆空间 - 核心逻辑 (JavaScript Logic)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('💑 [app.js] DOMContentLoaded 事件触发，初始化开始...');
    // ==========================================
    // 1. 初始化设置 & 本地存储数据读取
    // ==========================================
    let partnerName = '胡珊珊';
    let anniversaryStr = '2024-06-27';
    let themeSetting = localStorage.getItem('themeSetting') || 'light';

    // 云端为空时保持空状态，不再回填示例内容
    const defaultNotes = [];

    let notes = [...defaultNotes];

    const defaultMoments = [];

    let moments = [...defaultMoments];

    const defaultTimeline = [];

    let timelineData = [...defaultTimeline];

    const defaultPhotoWall = [];

    let photoWallPhotos = [];

    // 音频列表
    const trackList = [
        { name: 'Schoolgirl byebye - 爱是', src: 'assets/love_is.mp3', cover: 'assets/album_cover.jpg' },
        { name: '罗言,LSGCsikoriot - 靶心挂在嘴角', src: 'assets/罗言,LSGCsikoriot - 靶心挂在嘴角.mp3', cover: 'assets/album_cover.jpg' },
        { name: '夏之禹 - 殉情', src: 'assets/夏之禹 - 殉情.mp3', cover: 'assets/album_cover.jpg' },
        { name: 'deca joins - 夏夜晚风', src: 'assets/deca joins - 夏夜晚风.mp3', cover: 'assets/album_cover.jpg' },
        { name: 'JVKE - her', src: 'assets/JVKE - her.mp3', cover: 'assets/album_cover.jpg' },
        { name: 'moumoon - moonlight-Binaural recording ver.- (acoustic selection -ACOMOON-)', src: 'assets/moumoon - moonlight-Binaural recording ver.- (acoustic selection -ACOMOON-).mp3', cover: 'assets/album_cover.jpg' },
        { name: 'StrawberryPapa - morning flip', src: 'assets/StrawberryPapa - morning flip.mp3', cover: 'assets/album_cover.jpg' }
    ];
    let currentTrackIdx = 0;
    let musicPlayerController = null;

    // ==========================================
    // 2. DOM 元素获取
    // ==========================================
    // 计时器相关
    const daysVal = document.getElementById('daysVal');
    const hoursVal = document.getElementById('hoursVal');
    const minsVal = document.getElementById('minsVal');
    const secsVal = document.getElementById('secsVal');
    const anniversaryDisplay = document.getElementById('anniversaryDisplay');
    const nextBirthdayName = document.getElementById('nextBirthdayName');
    const nextBirthdayDate = document.getElementById('nextBirthdayDate');
    const nextBirthdayDays = document.getElementById('nextBirthdayDays');
    const nextAnniversaryDate = document.getElementById('nextAnniversaryDate');
    const nextAnniversaryDays = document.getElementById('nextAnniversaryDays');
    const partnerNameSpan = document.querySelector('.second-name');

    // 主题与弹窗控制相关
    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    // 留言板相关
    const corkboard = document.getElementById('corkboard');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const closeNoteModal = document.getElementById('closeNoteModal');
    const noteForm = document.getElementById('noteForm');
    const colorOptions = document.querySelectorAll('.color-option');
    let selectedNoteColor = 'yellow';

    // 纪念日配置相关
    const configBtn = document.getElementById('configBtn');
    const configModal = document.getElementById('configModal');
    const closeConfigModal = document.getElementById('closeConfigModal');
    const configForm = document.getElementById('configForm');
    const partnerNameInput = document.getElementById('partnerName');
    const anniversaryInput = document.getElementById('anniversaryInput');
    const bgMusicSelect = document.getElementById('bgMusicSelect');

    // 美好瞬间相关
    const momentsGrid = document.getElementById('momentsGrid');
    const addMomentBtn = document.getElementById('addMomentBtn');
    const momentModal = document.getElementById('momentModal');
    const closeMomentModal = document.getElementById('closeMomentModal');
    const momentForm = document.getElementById('momentForm');
    const momentModalTitle = document.getElementById('momentModalTitle');
    const momentPhotosInput = document.getElementById('momentPhotosInput');
    const momentPhotosPreview = document.getElementById('momentPhotosPreview');
    const momentSubmitBtn = document.getElementById('momentSubmitBtn');
    const momentDateInput = document.getElementById('momentDate');
    const momentTagSelect = document.getElementById('momentTag');
    const momentContentInput = document.getElementById('momentContent');

    // 美好瞬间编辑/上传临时状态变量
    let editingMomentId = null;
    let currentUploadedImages = [];

    // 音乐播放器相关
    const audioSource = document.getElementById('audioSource');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playerDisc = document.getElementById('playerDisc');
    const playerDiscCenter = document.querySelector('.disc-center');
    const trackTitle = document.getElementById('trackTitle');

    // 播放器新控制组件相关
    const playlistDropdown = document.getElementById('playlistDropdown');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const playModeBtn = document.getElementById('playModeBtn');
    const loopListIcon = document.getElementById('loopListIcon');
    const loopSingleIcon = document.getElementById('loopSingleIcon');

    // 照片墙 (时光轴迷你拍立得) 与灯箱相关
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDate = document.getElementById('lightboxDate');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const closeLightbox = document.getElementById('closeLightbox');
    const memoryPhotoWall = document.getElementById('memoryPhotoWall');
    const addPhotoWallBtn = document.getElementById('addPhotoWallBtn');
    const photoWallModal = document.getElementById('photoWallModal');
    const closePhotoWallModal = document.getElementById('closePhotoWallModal');
    const photoWallForm = document.getElementById('photoWallForm');
    const photoWallEditId = document.getElementById('photoWallEditId');
    const photoWallModalTitle = document.getElementById('photoWallModalTitle');
    const photoWallPhotoInput = document.getElementById('photoWallPhotoInput');
    const photoWallPhotoPreview = document.getElementById('photoWallPhotoPreview');
    const photoWallTitleInput = document.getElementById('photoWallTitle');
    const photoWallDateInput = document.getElementById('photoWallDate');
    const photoWallDescInput = document.getElementById('photoWallDesc');
    const photoWallSubmitBtn = document.getElementById('photoWallSubmitBtn');
    let currentPhotoWallImage = '';

    // 时光轴相关
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const addTimelineBtn = document.getElementById('addTimelineBtn');
    const timelineModal = document.getElementById('timelineModal');
    const closeTimelineModal = document.getElementById('closeTimelineModal');
    const timelineForm = document.getElementById('timelineForm');
    const timelinePhotos = document.getElementById('timelinePhotos');
    const timelinePhotosPreview = document.getElementById('timelinePhotosPreview');
    const timelineEditId = document.getElementById('timelineEditId');
    const timelineModalTitle = document.getElementById('timelineModalTitle');
    const timelineSubmitBtn = document.getElementById('timelineSubmitBtn');
    let currentModalPhotos = []; // 临时存储当前正在编辑/上传的照片数据

    // 身份验证与管理员面板 DOM 元素
    const editModeBtn = document.getElementById('editModeBtn');
    const logoutEditBtn = document.getElementById('logoutEditBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const authForm = document.getElementById('authForm');
    const authType = document.getElementById('authType');
    const authSecret = document.getElementById('authSecret');
    const createInviteForm = document.getElementById('createInviteForm');
    const inviteDisplayName = document.getElementById('inviteDisplayName');
    const createdInviteResult = document.getElementById('createdInviteResult');
    const newInviteCode = document.getElementById('newInviteCode');
    const adminDataList = document.getElementById('adminDataList');

    // ==========================================
    // 3. 初始渲染逻辑
    // ==========================================
    // 应用本地存储主题
    if (themeSetting === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    // 渲染留言墙与粒子系统
    initParticles();
    
    // 初始化登录身份和数据加载
    restoreIdentity().then(() => {
        loadCloudData();
    });

    // ==========================================
    // 4. 纪念日实时计时逻辑
    // ==========================================
    // 带有翻页动画的数字更新辅助函数
    function updateValWithFlip(el, val) {
        if (!el) return;
        if (el.textContent === val) return; // 值没有改变，无需动画
        
        // 添加动画类
        el.classList.add('flip-animate');
        
        // 动画执行到一半（90度水平状态）时更新文字内容
        setTimeout(() => {
            el.textContent = val;
        }, 150);
        
        // 动画完全结束后移除动画类
        setTimeout(() => {
            el.classList.remove('flip-animate');
        }, 300);
    }

    function updateLiveCounter() {
        const anniversaryDate = new Date(anniversaryStr + 'T00:00:00');
        const now = new Date();
        const diffMs = now - anniversaryDate;

        if (diffMs < 0) {
            // 如果纪念日设在未来
            updateValWithFlip(daysVal, '000');
            updateValWithFlip(hoursVal, '00');
            updateValWithFlip(minsVal, '00');
            updateValWithFlip(secsVal, '00');
            return;
        }

        // 计算天、小时、分钟、秒
        const totalSecs = Math.floor(diffMs / 1000);
        const secs = totalSecs % 60;
        const totalMins = Math.floor(totalSecs / 60);
        const mins = totalMins % 60;
        const totalHours = Math.floor(totalMins / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);

        // 格式化并用翻页动画更新
        updateValWithFlip(daysVal, String(days).padStart(3, '0'));
        updateValWithFlip(hoursVal, String(hours).padStart(2, '0'));
        updateValWithFlip(minsVal, String(mins).padStart(2, '0'));
        updateValWithFlip(secsVal, String(secs).padStart(2, '0'));
    }

    const birthdayMilestones = [
        { name: '邓子杰', date: '2004-06-23' },
        { name: '胡珊珊', date: '2002-11-28' }
    ];

    function getNextAnnualDate(dateStr, now = new Date()) {
        const [, month, day] = dateStr.split('-').map(Number);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let target = new Date(today.getFullYear(), month - 1, day);
        if (target < today) {
            target = new Date(today.getFullYear() + 1, month - 1, day);
        }
        return target;
    }

    function getDaysUntilDate(targetDate, now = new Date()) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.round((targetDate - today) / msPerDay);
    }

    function formatMonthDay(date) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    function updateMilestoneCard() {
        if (!nextBirthdayName || !nextBirthdayDate || !nextBirthdayDays || !nextAnniversaryDate || !nextAnniversaryDays) return;

        const now = new Date();
        const nextBirthday = birthdayMilestones
            .map((birthday) => {
                const nextDate = getNextAnnualDate(birthday.date, now);
                return {
                    ...birthday,
                    nextDate,
                    days: getDaysUntilDate(nextDate, now)
                };
            })
            .sort((a, b) => a.days - b.days)[0];

        const nextAnniversary = getNextAnnualDate(anniversaryStr, now);

        nextBirthdayName.textContent = `${nextBirthday.name}的生日`;
        nextBirthdayDate.textContent = formatMonthDay(nextBirthday.nextDate);
        nextBirthdayDays.textContent = String(nextBirthday.days);
        nextAnniversaryDate.textContent = formatMonthDay(nextAnniversary);
        nextAnniversaryDays.textContent = String(getDaysUntilDate(nextAnniversary, now));
    }

    // 启动计时，每秒刷新一次
    setInterval(updateLiveCounter, 1000);
    setInterval(updateMilestoneCard, 60 * 60 * 1000);
    updateLiveCounter(); // 首屏立即调用一次避免空白
    updateMilestoneCard();

    // 辅助格式化中文日期函数
    function formatDateCN(dateStr) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
        }
        return dateStr;
    }

    const photoWallPattern = [
        { left: '4%', top: '8px', width: '220px', rotate: '-5deg', ratio: '4 / 3' },
        { left: '29%', top: '34px', width: '180px', rotate: '4deg', ratio: '1 / 1' },
        { left: '52%', top: '8px', width: '260px', rotate: '-2deg', ratio: '16 / 10' },
        { left: '77%', top: '58px', width: '170px', rotate: '6deg', ratio: '3 / 4' },
        { left: '10%', top: '224px', width: '165px', rotate: '5deg', ratio: '3 / 4' },
        { left: '31%', top: '205px', width: '255px', rotate: '-6deg', ratio: '1 / 1' },
        { left: '58%', top: '245px', width: '185px', rotate: '3deg', ratio: '4 / 3' },
        { left: '76%', top: '265px', width: '220px', rotate: '-4deg', ratio: '4 / 3' },
        { left: '3%', top: '430px', width: '250px', rotate: '2deg', ratio: '16 / 10' },
        { left: '34%', top: '440px', width: '170px', rotate: '-3deg', ratio: '1 / 1' },
        { left: '54%', top: '415px', width: '190px', rotate: '5deg', ratio: '3 / 4' },
        { left: '73%', top: '450px', width: '235px', rotate: '-2deg', ratio: '16 / 10' }
    ];

    function renderPhotoWall() {
        if (!memoryPhotoWall) return;

        const photos = photoWallPhotos;
        memoryPhotoWall.innerHTML = '';

        if (photos.length === 0) {
            memoryPhotoWall.innerHTML = '<div class="memory-wall-empty">还没有照片，进入编辑模式后贴上第一张吧。</div>';
            return;
        }

        const bandHeight = 560;
        const bands = Math.ceil(photos.length / photoWallPattern.length);
        const isCompactPhotoWall = window.matchMedia('(max-width: 900px)').matches;
        memoryPhotoWall.style.minHeight = isCompactPhotoWall
            ? ''
            : `${620 + Math.max(0, bands - 1) * bandHeight}px`;

        photos.forEach((photo, index) => {
            const pattern = photoWallPattern[index % photoWallPattern.length];
            const band = Math.floor(index / photoWallPattern.length);
            const photoButton = document.createElement('article');
            photoButton.className = 'memory-wall-photo';
            photoButton.setAttribute('role', 'button');
            photoButton.setAttribute('tabindex', '0');
            const photoRatio = normalizePhotoRatio(photo.ratio) || pattern.ratio;
            photoButton.style.setProperty('--left', pattern.left);
            photoButton.style.setProperty('--top', `calc(${pattern.top} + ${band * bandHeight}px)`);
            photoButton.style.setProperty('--width', pattern.width);
            photoButton.style.setProperty('--rotate', pattern.rotate);
            photoButton.style.setProperty('--ratio', photoRatio);
            photoButton.style.setProperty('--mobile-offset', index % 2 === 0 ? '0px' : '18px');
            photoButton.style.zIndex = String((index % photoWallPattern.length) + 1);
            photoButton.innerHTML = `
                <img src="${photo.src}" alt="${escapeHTML(photo.title)}" loading="lazy">
                <div class="memory-wall-caption">${escapeHTML(photo.title)}</div>
                <div class="photo-wall-actions editor-only">
                    <button type="button" class="timeline-action-btn edit-photo-wall-btn" data-id="${photo.id}" title="编辑这张照片">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="timeline-action-btn delete-photo-wall-btn" data-id="${photo.id}" title="删除这张照片">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            photoButton.addEventListener('click', () => {
                lightboxImg.src = photo.src;
                lightboxTitle.textContent = photo.title;
                lightboxDate.textContent = `拍摄于: ${photo.date || '某个闪光日子'}`;
                lightboxDesc.textContent = photo.desc || '这也是我们收藏起来的一小块时间。';
                openModal(lightboxModal);
            });
            photoButton.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                photoButton.click();
            });

            const photoImg = photoButton.querySelector('img');
            photoImg?.addEventListener('load', () => {
                if (normalizePhotoRatio(photo.ratio) || !photoImg.naturalWidth || !photoImg.naturalHeight) return;
                const naturalRatio = `${photoImg.naturalWidth} / ${photoImg.naturalHeight}`;
                photo.ratio = naturalRatio;
                photoButton.style.setProperty('--ratio', naturalRatio);
            });

            photoButton.querySelector('.edit-photo-wall-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                startEditPhotoWallPhoto(photo.id);
            });

            photoButton.querySelector('.delete-photo-wall-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePhotoWallPhoto(photo.id);
            });

            memoryPhotoWall.appendChild(photoButton);
        });
    }

    function renderPhotoWallPreview() {
        if (!photoWallPhotoPreview) return;
        photoWallPhotoPreview.innerHTML = '';

        if (!currentPhotoWallImage) return;

        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${currentPhotoWallImage}" alt="照片墙预览">
            <button type="button" class="remove-photo-btn" title="移除照片">&times;</button>
        `;
        photoWallPhotoPreview.appendChild(previewItem);
        previewItem.querySelector('.remove-photo-btn')?.addEventListener('click', () => {
            currentPhotoWallImage = '';
            renderPhotoWallPreview();
        });
    }

    function canEditPhotoWallPhoto(photo) {
        return currentIdentity?.role === 'admin' || photo.authorId === currentIdentity?.editorId;
    }

    function normalizePhotoRatio(ratio) {
        if (!ratio) return '';
        const [rawWidth, rawHeight] = String(ratio).split('/').map((part) => Number(part.trim()));
        if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawWidth <= 0 || rawHeight <= 0) return '';
        const width = Math.max(1, Math.round(rawWidth));
        const height = Math.max(1, Math.round(rawHeight));
        return `${width} / ${height}`;
    }

    function getImageRatio(src) {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                if (!image.naturalWidth || !image.naturalHeight) {
                    resolve('');
                    return;
                }
                resolve(`${image.naturalWidth} / ${image.naturalHeight}`);
            };
            image.onerror = () => resolve('');
            image.src = src;
        });
    }

    function applyNaturalImageRatio(imgEl) {
        const wrapper = imgEl.closest('.moment-img-wrapper');
        if (!wrapper || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
        const naturalRatio = `${imgEl.naturalWidth} / ${imgEl.naturalHeight}`;
        wrapper.style.setProperty('--ratio', naturalRatio);
    }

    function openPhotoWallCreateModal() {
        currentPhotoWallImage = '';
        photoWallForm.reset();
        photoWallEditId.value = '';
        photoWallModalTitle.textContent = '贴一张新照片 🖼️';
        photoWallSubmitBtn.textContent = '贴上照片墙';
        photoWallDateInput.value = new Date().toISOString().split('T')[0];
        renderPhotoWallPreview();
        openModal(photoWallModal);
    }

    function startEditPhotoWallPhoto(id) {
        const photo = photoWallPhotos.find(item => item.id === id || String(item.id) === id);
        if (!photo) return;

        if (!canEditPhotoWallPhoto(photo)) {
            notify('您只能修改自己创建的照片哦', 'error');
            return;
        }

        currentPhotoWallImage = photo.src;
        photoWallForm.reset();
        photoWallEditId.value = photo.id;
        photoWallTitleInput.value = photo.title || '';
        photoWallDateInput.value = photo.date || new Date().toISOString().split('T')[0];
        photoWallDescInput.value = photo.desc || '';
        photoWallModalTitle.textContent = '修改照片墙照片 ✏️';
        photoWallSubmitBtn.textContent = '保存修改';
        renderPhotoWallPreview();
        openModal(photoWallModal);
    }

    async function deletePhotoWallPhoto(id) {
        const photo = photoWallPhotos.find(item => item.id === id || String(item.id) === id);
        if (!photo) return;

        if (!canEditPhotoWallPhoto(photo)) {
            notify('您只能删除自己创建的照片哦', 'error');
            return;
        }

        if (!await askConfirm('确定要从照片墙移除这张照片吗？', { confirmText: '移除' })) return;

        try {
            if (String(photo.id).startsWith('default-')) {
                photoWallPhotos = photoWallPhotos.filter(item => item.id !== photo.id);
                renderPhotoWall();
                return;
            }
            await window.MemoryCloudApi.deletePhotoWallPhoto(photo.id);
            photoWallPhotos = photoWallPhotos.filter(item => item.id !== photo.id);
            renderPhotoWall();
        } catch (err) {
            notify('删除照片失败: ' + err.message, 'error');
        }
    }

    // ==========================================
    // 5. 留言许愿墙渲染与操作
    // ==========================================
    function renderNotes() {
        corkboard.innerHTML = '';
        notes.forEach((note, index) => {
            const card = document.createElement('div');
            card.className = `sticky-note ${note.color}`;
            
            // 产生随机微倾斜角度以模拟手贴效果
            const randomTilt = (Math.random() * 8 - 4).toFixed(1);
            card.style.setProperty('--tilt', `${randomTilt}deg`);

            card.innerHTML = `
                <div class="note-body">${escapeHTML(note.text)}</div>
                <div class="note-footer">
                    <span class="note-author">From: ${escapeHTML(note.author)}</span>
                    <span class="note-time">${note.date}</span>
                    <button class="delete-note editor-only" data-index="${index}" title="撕掉这张便签">×</button>
                </div>
            `;
            corkboard.appendChild(card);
        });

        // 绑定删除按钮事件
        const deleteButtons = corkboard.querySelectorAll('.delete-note');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                await deleteNote(idx);
            });
        });
    }

    async function addNote(author, text, color) {
        try {
            const result = await window.MemoryCloudApi.createNote({ text, color });
            const note = result.note;
            notes.unshift({
                id: note.id,
                author: note.authorName,
                text: note.text,
                color: note.color,
                date: note.createdAt.slice(0, 10),
                authorId: note.authorId
            });
            renderNotes();
        } catch (err) {
            notify('添加留言失败: ' + err.message, 'error');
        }
    }

    async function deleteNote(index) {
        const note = notes[index];
        if (!note) return;

        if (currentIdentity?.role !== 'admin' && note.authorId !== currentIdentity?.editorId) {
            notify('您只能删除自己创建的留言哦', 'error');
            return;
        }

        if (!await askConfirm('确定要撕掉这张回忆便签吗？这将永久删除它。', { confirmText: '撕掉' })) return;

        try {
            if (typeof note.id === 'number') {
                notes.splice(index, 1);
                renderNotes();
                return;
            }
            await window.MemoryCloudApi.deleteNote(note.id);
            notes.splice(index, 1);
            renderNotes();
        } catch (err) {
            notify('删除失败: ' + err.message, 'error');
        }
    }

    // ==========================================
    // 5b. 美好瞬间渲染与操作
    // ==========================================
    function getTagColors(tag) {
        switch (tag) {
            case '甜食':
                return { color: '#FF8A80', bg: 'rgba(255, 235, 238, 0.45)' };
            case '散步':
                return { color: '#81C784', bg: 'rgba(232, 245, 233, 0.45)' };
            case '宠物':
                return { color: '#FFB74D', bg: 'rgba(255, 243, 224, 0.45)' };
            case '游戏':
                return { color: '#BA68C8', bg: 'rgba(243, 229, 245, 0.45)' };
            case '礼物':
                return { color: '#F06292', bg: 'rgba(252, 228, 236, 0.45)' };
            case '晴雨':
                return { color: '#4FC3F7', bg: 'rgba(225, 245, 254, 0.45)' };
            case '日常':
            default:
                return { color: '#EC407A', bg: 'rgba(252, 228, 236, 0.45)' };
        }
    }

    // 图片前端等比缩放压缩函数 (最大边长限制为 600px，质量 0.7)
    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let width = img.width;
                    let height = img.height;
                    const maxSide = 600;

                    if (width > maxSide || height > maxSide) {
                        if (width > height) {
                            height = Math.round((height * maxSide) / width);
                            width = maxSide;
                        } else {
                            width = Math.round((width * maxSide) / height);
                            height = maxSide;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedBase64);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // 渲染照片上传预览区
    function renderUploadedImagesPreview() {
        if (!momentPhotosPreview) return;
        momentPhotosPreview.innerHTML = '';
        currentUploadedImages.forEach((imgSrc, idx) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${imgSrc}" alt="预览照片">
                <button type="button" class="remove-preview-btn" data-index="${idx}" title="删除此照片">×</button>
            `;
            momentPhotosPreview.appendChild(previewItem);
        });

        // 绑定删除已选照片的交互
        const removeBtns = momentPhotosPreview.querySelectorAll('.remove-preview-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                currentUploadedImages.splice(idx, 1);
                renderUploadedImagesPreview();
            });
        });
    }

    function renderMoments() {
        if (!momentsGrid) return;
        momentsGrid.innerHTML = '';
        moments.forEach((m, index) => {
            const card = document.createElement('div');
            card.className = 'moment-card';
            
            // 设置分类特定的颜色变量
            const colors = getTagColors(m.tag);
            card.style.setProperty('--tag-color', colors.color);
            card.style.setProperty('--tag-bg', colors.bg);

            // 构建瞬间卡片中的图片网格 HTML
            let imagesHtml = '';
            if (m.images && m.images.length > 0) {
                const countClass = m.images.length === 1 ? 'count-1' :
                                   m.images.length === 2 ? 'count-2' :
                                   m.images.length === 3 ? 'count-3' :
                                   m.images.length === 4 ? 'count-4' : 'count-more';
                imagesHtml = `<div class="moment-images ${countClass}">`;
                m.images.forEach(imgSrc => {
                    imagesHtml += `
                        <div class="moment-img-wrapper">
                            <img src="${imgSrc}" alt="瞬间照片" loading="lazy">
                        </div>
                    `;
                });
                imagesHtml += `</div>`;
            }
            
            card.innerHTML = `
                <div class="moment-header">
                    <span class="moment-icon-box">${escapeHTML(m.icon)}</span>
                    <span class="moment-tag">${escapeHTML(m.tag)}</span>
                </div>
                <div class="moment-body">${escapeHTML(m.content)}</div>
                ${imagesHtml}
                <div class="moment-footer">
                    <span class="moment-date">${m.date}</span>
                    <div class="moment-actions editor-only">
                        <button class="edit-moment-btn" data-index="${index}" title="编辑这刻美好">✏️</button>
                        <button class="delete-moment-btn" data-index="${index}" title="删除这刻美好">×</button>
                    </div>
                </div>
            `;
            momentsGrid.appendChild(card);

            // 绑定卡片内照片点击大图预览 (无缝整合 lightbox)
            const imgEls = card.querySelectorAll('.moment-img-wrapper img');
            imgEls.forEach(imgEl => {
                if (imgEl.complete) {
                    applyNaturalImageRatio(imgEl);
                } else {
                    imgEl.addEventListener('load', () => applyNaturalImageRatio(imgEl), { once: true });
                }
                imgEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    lightboxImg.src = imgEl.src;
                    lightboxTitle.textContent = `${m.icon} ${m.tag}`;
                    lightboxDate.textContent = `记录于: ${m.date}`;
                    lightboxDesc.textContent = m.content;
                    openModal(lightboxModal);
                });
            });
        });
        
        // 绑定删除与编辑事件
        const deleteBtns = momentsGrid.querySelectorAll('.delete-moment-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                deleteMoment(idx);
            });
        });

        const editBtns = momentsGrid.querySelectorAll('.edit-moment-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                startEditMoment(idx);
            });
        });

    }

    function startEditMoment(index) {
        const m = moments[index];
        if (!m) return;

        editingMomentId = m.id;
        currentUploadedImages = m.images ? [...m.images] : [];

        // 填充表单数据
        momentContentInput.value = m.content;
        momentDateInput.value = m.date;
        momentTagSelect.value = `${m.icon},${m.tag}`;

        // 更新弹窗标题与提交按钮文本
        momentModalTitle.textContent = '编辑这刻的小美好 ✏️';
        momentSubmitBtn.textContent = '保存修改';

        // 渲染已上传照片预览
        renderUploadedImagesPreview();

        // 打开弹窗
        openModal(momentModal);
    }

    async function deleteMoment(index) {
        const m = moments[index];
        if (!m) return;

        if (currentIdentity?.role !== 'admin' && m.authorId !== currentIdentity?.editorId) {
            notify('您只能删除自己创建的瞬间哦', 'error');
            return;
        }

        if (!await askConfirm('确定要移出这刻的美好瞬间吗？', { confirmText: '移出' })) return;

        const card = momentsGrid.children[index];
        try {
            if (typeof m.id === 'number') {
                if (card) {
                    card.classList.add('fade-out');
                    card.addEventListener('animationend', () => {
                        moments.splice(index, 1);
                        renderMoments();
                    });
                } else {
                    moments.splice(index, 1);
                    renderMoments();
                }
                return;
            }

            await window.MemoryCloudApi.deleteMoment(m.id);
            if (card) {
                card.classList.add('fade-out');
                card.addEventListener('animationend', () => {
                    moments.splice(index, 1);
                    renderMoments();
                });
            } else {
                moments.splice(index, 1);
                renderMoments();
            }
        } catch (err) {
            notify('删除瞬间失败: ' + err.message, 'error');
        }
    }

    // 防止HTML注入的安全辅助函数
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function notify(message, type = 'info') {
        window.MemoryFeedback?.showToast(message, type);
    }

    function askConfirm(message, options = {}) {
        return window.MemoryFeedback?.confirmAction(message, options) ?? Promise.resolve(false);
    }

    // ==========================================
    // 6. 音频播放器逻辑
    // ==========================================
    musicPlayerController = window.MemoryMusicPlayer.init({ trackList, initialIndex: currentTrackIdx });



    // ==========================================
    // 8. 弹窗控制逻辑 (留言、配置、灯箱大图)
    // ==========================================
    // 通用打开弹窗函数
    function openModal(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 禁止页面背景滚动
    }

    // 通用关闭弹窗函数
    function closeModal(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // 留言弹窗
    addNoteBtn.addEventListener('click', () => openModal(noteModal));
    closeNoteModal.addEventListener('click', () => closeModal(noteModal));

    // 选择信纸颜色
    colorOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedNoteColor = opt.getAttribute('data-color');
        });
    });

    // 新增留言提交
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('authorName').value.trim();
        const text = document.getElementById('noteContent').value.trim();

        if (author && text) {
            addNote(author, text, selectedNoteColor);
            noteForm.reset();
            // 重置颜色选择器为 active
            colorOptions.forEach(o => o.classList.remove('active'));
            document.querySelector('.option-yellow').classList.add('active');
            selectedNoteColor = 'yellow';
            closeModal(noteModal);
        }
    });

    // 美好瞬间弹窗控制
    addMomentBtn.addEventListener('click', () => {
        editingMomentId = null;
        currentUploadedImages = [];
        
        momentForm.reset();
        
        // 默认将日期选择器设为今天
        const todayStr = new Date().toISOString().split('T')[0];
        momentDateInput.value = todayStr;

        // 重置弹窗标题与提交按钮文本
        momentModalTitle.textContent = '记录这刻的小美好 ✨';
        momentSubmitBtn.textContent = '收入美好集';

        // 渲染清空的照片预览
        renderUploadedImagesPreview();
        
        openModal(momentModal);
    });
    closeMomentModal.addEventListener('click', () => closeModal(momentModal));

    // 本地图片上传变化监听
    if (momentPhotosInput) {
        momentPhotosInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            for (const file of files) {
                if (!file.type.startsWith('image/')) continue;
                try {
                    const compressedBase64 = await compressImage(file);
                    currentUploadedImages.push(compressedBase64);
                } catch (err) {
                    console.error("图片压缩失败:", err);
                }
            }
            // 清空 file input 使得可以重复选择相同文件
            momentPhotosInput.value = '';
            renderUploadedImagesPreview();
        });
    }

    // 拖拽上传支持
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    if (uploadPlaceholder && momentPhotosInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadPlaceholder.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadPlaceholder.addEventListener(eventName, () => {
                uploadPlaceholder.style.borderColor = 'var(--accent-color)';
                uploadPlaceholder.style.background = 'rgba(255, 255, 255, 0.08)';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadPlaceholder.addEventListener(eventName, () => {
                uploadPlaceholder.style.borderColor = '';
                uploadPlaceholder.style.background = '';
            }, false);
        });

        uploadPlaceholder.addEventListener('drop', async (e) => {
            const dt = e.dataTransfer;
            const files = Array.from(dt.files).filter(file => file.type.startsWith('image/'));
            if (files.length === 0) return;

            for (const file of files) {
                try {
                    const compressedBase64 = await compressImage(file);
                    currentUploadedImages.push(compressedBase64);
                } catch (err) {
                    console.error("图片压缩失败:", err);
                }
            }
            renderUploadedImagesPreview();
        }, false);
    }

    // 美好瞬间提交 (新增与编辑)
    momentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = momentContentInput.value.trim();
        const date = momentDateInput.value;
        const tagValue = momentTagSelect.value; // 例如 "🍰,甜食"

        const [icon, tag] = tagValue.split(',');

        if (content && date && icon && tag) {
            momentSubmitBtn.disabled = true;
            momentSubmitBtn.textContent = '保存中...';

            try {
                const uploadedImages = [];
                for (let i = 0; i < currentUploadedImages.length; i += 1) {
                    const img = currentUploadedImages[i];
                    if (img.startsWith('http') || img.startsWith('assets/')) {
                        uploadedImages.push(img);
                    } else {
                        const result = await window.MemoryCloudApi.uploadPhoto({
                            filename: `moment-${Date.now()}-${i}.jpg`,
                            dataUrl: img
                        });
                        uploadedImages.push(result.photo.url);
                    }
                }

                if (editingMomentId !== null) {
                    // 编辑现有瞬间
                    const editIdx = moments.findIndex(m => m.id === editingMomentId);
                    if (editIdx !== -1) {
                        const response = await window.MemoryCloudApi.updateMoment(editingMomentId, {
                            icon,
                            tag,
                            content,
                            date,
                            images: uploadedImages
                        });
                        moments[editIdx] = response.moment;
                        renderMoments();
                    }
                } else {
                    // 新建瞬间
                    const response = await window.MemoryCloudApi.createMoment({
                        icon,
                        tag,
                        content,
                        date,
                        images: uploadedImages
                    });
                    moments.unshift(response.moment);
                    renderMoments();
                }
                
                momentForm.reset();
                closeModal(momentModal);
            } catch (err) {
                notify('保存瞬间失败: ' + err.message, 'error');
            } finally {
                momentSubmitBtn.disabled = false;
                momentSubmitBtn.textContent = editingMomentId !== null ? '保存修改' : '收入美好集';
            }
        }
    });

    if (addPhotoWallBtn) {
        addPhotoWallBtn.addEventListener('click', openPhotoWallCreateModal);
    }

    if (closePhotoWallModal) {
        closePhotoWallModal.addEventListener('click', () => closeModal(photoWallModal));
    }

    if (photoWallPhotoInput) {
        photoWallPhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;

            try {
                currentPhotoWallImage = await compressImage(file, 1200, 1200, 0.78);
                if (!photoWallTitleInput.value.trim()) {
                    photoWallTitleInput.value = file.name.substring(0, file.name.lastIndexOf('.')) || '我们的照片';
                }
                renderPhotoWallPreview();
            } catch (err) {
                console.error('照片墙图片压缩失败:', err);
                notify(`图片 ${file.name} 读取或压缩失败！`, 'error');
            } finally {
                photoWallPhotoInput.value = '';
            }
        });
    }

    if (photoWallForm) {
        photoWallForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = photoWallEditId.value;
            const title = photoWallTitleInput.value.trim();
            const date = photoWallDateInput.value;
            const desc = photoWallDescInput.value.trim();

            if (!title || !date || !currentPhotoWallImage) {
                notify('请至少选择照片，并填写标题和日期', 'error');
                return;
            }

            photoWallSubmitBtn.disabled = true;
            photoWallSubmitBtn.textContent = '保存中...';

            try {
                let src = currentPhotoWallImage;
                const ratio = normalizePhotoRatio(await getImageRatio(src));
                if (!src.startsWith('http') && !src.startsWith('assets/')) {
                    const result = await window.MemoryCloudApi.uploadPhoto({
                        filename: `photo-wall-${Date.now()}.jpg`,
                        dataUrl: src
                    });
                    src = result.photo.url;
                }

                if (id && !String(id).startsWith('default-')) {
                    const response = await window.MemoryCloudApi.updatePhotoWallPhoto(id, { title, date, desc, src, ratio });
                    const index = photoWallPhotos.findIndex(photo => photo.id === id || String(photo.id) === id);
                    if (index !== -1) {
                        photoWallPhotos[index] = response.photo;
                    }
                } else {
                    const response = await window.MemoryCloudApi.createPhotoWallPhoto({ title, date, desc, src, ratio });
                    if (id) {
                        const index = photoWallPhotos.findIndex(photo => photo.id === id || String(photo.id) === id);
                        if (index !== -1) {
                            photoWallPhotos[index] = response.photo;
                        } else {
                            photoWallPhotos.unshift(response.photo);
                        }
                    } else {
                        photoWallPhotos.unshift(response.photo);
                    }
                }

                renderPhotoWall();
                closeModal(photoWallModal);
            } catch (err) {
                notify('保存照片失败: ' + err.message, 'error');
            } finally {
                photoWallSubmitBtn.disabled = false;
                photoWallSubmitBtn.textContent = id ? '保存修改' : '贴上照片墙';
            }
        });
    }

    // 纪念日修改弹窗
    configBtn.addEventListener('click', () => openModal(configModal));
    closeConfigModal.addEventListener('click', () => closeModal(configModal));

    // 纪念日修改保存
    configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPartner = partnerNameInput.value.trim();
        const newDate = anniversaryInput.value;
        const newMusic = bgMusicSelect.value;

        if (newPartner && newDate) {
            const submitBtn = configForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = '保存中...';

            try {
                const response = await window.MemoryCloudApi.updateConfig({
                    partnerName: newPartner,
                    anniversaryDate: newDate
                });
                
                partnerName = response.config.partnerName;
                anniversaryStr = response.config.anniversaryDate;

                // 更新展示
                partnerNameSpan.textContent = partnerName;
                anniversaryDisplay.textContent = formatDateCN(anniversaryStr);
                updateLiveCounter();
                updateMilestoneCard();

                // 检查音乐是否变了
                if (newMusic) {
                    const foundIdx = trackList.findIndex(t => t.src === newMusic);
                    if (foundIdx !== -1) {
                        musicPlayerController?.playTrack(foundIdx);
                    }
                }

                closeModal(configModal);
            } catch (err) {
                notify('修改纪念日失败: ' + err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '保存设置';
            }
        }
    });

    // ==========================================
    // 7. 时光轴动态渲染、分类筛选与交互
    // ==========================================
    // 动态滚动入场动效使用 Intersection Observer
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.15 });

    // 图片等比压缩至 max_size 并转为 Base64 格式
    function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // 渲染弹窗中的照片预览列表
    function renderModalPhotosPreview() {
        timelinePhotosPreview.innerHTML = '';
        currentModalPhotos.forEach((photo, idx) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${photo.src}" alt="Preview">
                <input type="text" class="photo-caption-input" value="${escapeHTML(photo.title)}" placeholder="手写小标题..." data-index="${idx}">
                <button type="button" class="remove-photo-btn" data-index="${idx}">&times;</button>
            `;
            timelinePhotosPreview.appendChild(previewItem);
        });

        // 绑定预览框中单张图片标题的修改
        timelinePhotosPreview.querySelectorAll('.photo-caption-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                if (currentModalPhotos[idx]) {
                    currentModalPhotos[idx].title = e.target.value.trim() || '我们的回忆';
                }
            });
        });

        // 绑定删除按钮
        timelinePhotosPreview.querySelectorAll('.remove-photo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                currentModalPhotos.splice(idx, 1);
                renderModalPhotosPreview();
            });
        });
    }

    // 初始化拍立得卡片排布与拖动/灯箱逻辑
    let miniHighestZIndex = 10;
    function initTimelinePolaroids() {
        const timelinePolaroidsContainers = document.querySelectorAll('.timeline-polaroids');
        
        timelinePolaroidsContainers.forEach(container => {
            const cards = container.querySelectorAll('.mini-polaroid');
            const containerWidth = container.clientWidth || 350;
            const containerHeight = container.clientHeight || 320;
            const cardWidth = 130;
            const cardHeight = 140;

            const total = cards.length;
            cards.forEach((card, idx) => {
                let x, y;
                if (total === 1) {
                    x = (containerWidth - cardWidth) / 2;
                    y = (containerHeight - cardHeight) / 2;
                } else if (total === 2) {
                    if (idx === 0) {
                        x = Math.random() * 25 + 15;
                        y = Math.random() * 35 + 20;
                    } else {
                        x = containerWidth - cardWidth - (Math.random() * 25 + 15);
                        y = containerHeight - cardHeight - (Math.random() * 35 + 20);
                    }
                } else {
                    const cols = 2;
                    const colIdx = idx % cols;
                    const rowIdx = Math.floor(idx / cols);
                    
                    const regionWidth = containerWidth / cols;
                    const regionHeight = containerHeight / Math.ceil(total / cols);
                    
                    x = colIdx * regionWidth + Math.random() * (regionWidth - cardWidth - 15) + 5;
                    y = rowIdx * regionHeight + Math.random() * (regionHeight - cardHeight - 15) + 5;
                }

                x = Math.max(-10, Math.min(containerWidth - cardWidth + 10, x));
                y = Math.max(-5, Math.min(containerHeight - cardHeight + 5, y));

                const rotation = Math.random() * 16 - 8;
                
                card.style.left = `${x}px`;
                card.style.top = `${y}px`;
                card.style.setProperty('--rotation', `${rotation}deg`);
                card.style.zIndex = idx + 1;
            });
        });

        // 绑定拖拽
        const miniPolaroids = document.querySelectorAll('.mini-polaroid');
        miniPolaroids.forEach(card => {
            let isDragging = false;
            let startX, startY;
            let initialLeft, initialTop;
            let hasMoved = false;
            const container = card.parentElement;

            card.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                
                isDragging = true;
                hasMoved = false;
                card.classList.add('dragging');
                
                miniHighestZIndex++;
                card.style.zIndex = miniHighestZIndex;

                startX = e.clientX;
                startY = e.clientY;
                initialLeft = parseFloat(card.style.left) || 0;
                initialTop = parseFloat(card.style.top) || 0;

                card.setPointerCapture(e.pointerId);
                e.preventDefault();
            });

            card.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                    hasMoved = true;
                }

                let newLeft = initialLeft + dx;
                let newTop = initialTop + dy;

                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const cardWidth = 130;
                const cardHeight = 130;

                newLeft = Math.max(-20, Math.min(containerWidth - cardWidth + 10, newLeft));
                newTop = Math.max(-10, Math.min(containerHeight - cardHeight + 10, newTop));

                card.style.left = `${newLeft}px`;
                card.style.top = `${newTop}px`;
            });

            card.addEventListener('pointerup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                card.classList.remove('dragging');
                card.releasePointerCapture(e.pointerId);

                if (!hasMoved) {
                    const img = card.querySelector('img').src;
                    const title = card.getAttribute('data-title');
                    const date = card.getAttribute('data-date');
                    const desc = card.getAttribute('data-desc');

                    lightboxImg.src = img;
                    lightboxTitle.textContent = title;
                    lightboxDate.textContent = `拍摄于: ${date}`;
                    lightboxDesc.textContent = desc;

                    openModal(lightboxModal);
                }
            });

            card.addEventListener('pointercancel', (e) => {
                if (!isDragging) return;
                isDragging = false;
                card.classList.remove('dragging');
                card.releasePointerCapture(e.pointerId);
            });
        });
    }

    // 动态渲染时光轴列表
    function renderTimeline() {
        if (!timelineWrapper) return;
        
        timelineWrapper.innerHTML = '<div class="timeline-line"></div>';

        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const filterVal = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        // 复制并按日期升序重排
        const sortedTimeline = [...timelineData].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTimeline.forEach((item, index) => {
            if (filterVal !== 'all' && item.category !== filterVal) {
                return;
            }

            const itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item';
            itemDiv.setAttribute('data-category', item.category);
            itemDiv.setAttribute('data-id', item.id);

            let categoryName = '日常生活';
            let tagClass = 'tag-daily';
            let tintClass = 'sv-tint-pink';

            if (item.category === 'milestone') {
                categoryName = '里程碑';
                tagClass = 'tag-milestone';
                tintClass = 'sv-tint-green';
            } else if (item.category === 'travel') {
                categoryName = '旅行记事';
                tagClass = 'tag-travel';
                tintClass = index % 2 === 0 ? 'sv-tint-yellow' : 'sv-tint-blue';
            } else if (item.category === 'daily') {
                categoryName = '日常生活';
                tagClass = 'tag-daily';
                tintClass = 'sv-tint-pink';
            }

            let polaroidsHTML = '';
            if (item.photos && item.photos.length > 0) {
                item.photos.forEach(photo => {
                    polaroidsHTML += `
                        <div class="mini-polaroid" data-title="${escapeHTML(photo.title)}" data-date="${item.date}" data-desc="${escapeHTML(photo.desc || item.content)}">
                            <div class="mini-photo">
                                <img src="${photo.src}" alt="${escapeHTML(photo.title)}" loading="lazy">
                            </div>
                        </div>
                    `;
                });
            } else {
                polaroidsHTML += `
                    <div class="mini-polaroid placeholder-polaroid" data-title="爱的瞬间" data-date="${item.date}" data-desc="${escapeHTML(item.content)}">
                        <div class="mini-photo" style="display:flex;align-items:center;justify-content:center;background:rgba(255, 182, 193, 0.1);">
                            <span style="font-size:2rem;">💖</span>
                        </div>
                    </div>
                `;
            }

            itemDiv.innerHTML = `
                <div class="timeline-dot">
                    <img src="assets/sv_junimo.gif" class="sv-timeline-sprite ${tintClass}" alt="Junimo">
                </div>
                <div class="timeline-text-side glass-card">
                    <div class="time-header">
                        <div>
                            <span class="date">${item.date}</span>
                            <span class="tag ${tagClass}">${categoryName}</span>
                        </div>
                        <div class="timeline-actions editor-only">
                            <button class="timeline-action-btn edit-timeline-btn" data-id="${item.id}" title="编辑这刻回忆">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="timeline-action-btn delete-timeline-btn" data-id="${item.id}" title="删除这刻回忆">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                    <h3>${escapeHTML(item.title)}</h3>
                    <p>${escapeHTML(item.content)}</p>
                </div>
                <div class="timeline-photo-side">
                    <div class="timeline-polaroids">
                        ${polaroidsHTML}
                    </div>
                </div>
            `;
            
            // 绑定编辑事件
            itemDiv.querySelectorAll('.edit-timeline-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const item = timelineData.find(t => t.id === id);
                    if (item) {
                        timelineEditId.value = item.id;
                        document.getElementById('timelineDate').value = item.date;
                        document.getElementById('timelineCategory').value = item.category;
                        document.getElementById('timelineTitle').value = item.title;
                        document.getElementById('timelineContent').value = item.content;
                        timelineModalTitle.textContent = '修改回忆时刻 ✏️';
                        timelineSubmitBtn.textContent = '保存修改';
                        
                        currentModalPhotos = item.photos ? JSON.parse(JSON.stringify(item.photos)) : [];
                        renderModalPhotosPreview();
                        openModal(timelineModal);
                    }
                });
            });

            // 绑定删除事件
            itemDiv.querySelectorAll('.delete-timeline-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const item = timelineData.find(t => t.id === id);
                    if (!item) return;

                    if (currentIdentity?.role !== 'admin' && item.authorId !== currentIdentity?.editorId) {
                        notify('您只能删除自己创建的时光回忆哦', 'error');
                        return;
                    }

                    if (!await askConfirm('确定要删除这刻时光回忆吗？这将无法撤销。', { confirmText: '删除' })) return;

                    try {
                        if (typeof item.id === 'number' || !isNaN(Number(item.id))) {
                            timelineData = timelineData.filter(t => t.id !== id);
                            renderTimeline();
                            return;
                        }
                        await window.MemoryCloudApi.deleteTimeline(id);
                        timelineData = timelineData.filter(t => t.id !== id);
                        renderTimeline();
                    } catch (err) {
                        notify('删除失败: ' + err.message, 'error');
                    }
                });
            });

            timelineWrapper.appendChild(itemDiv);
            timelineObserver.observe(itemDiv);
        });

        // 安排拍立得位置
        setTimeout(initTimelinePolaroids, 100);
    }

    // 绑定添加时光按钮事件
    if (addTimelineBtn) {
        addTimelineBtn.addEventListener('click', () => {
            timelineForm.reset();
            const todayStr = new Date().toISOString().split('T')[0];
            document.getElementById('timelineDate').value = todayStr;
            timelineEditId.value = '';
            timelineModalTitle.textContent = '新增回忆时刻 ⏳';
            timelineSubmitBtn.textContent = '收入时光轴';
            currentModalPhotos = [];
            renderModalPhotosPreview();
            openModal(timelineModal);
        });
    }

    // 关闭时光轴弹窗
    if (closeTimelineModal) {
        closeTimelineModal.addEventListener('click', () => closeModal(timelineModal));
    }

    // 监听本地照片多选上传
    if (timelinePhotos) {
        timelinePhotos.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            for (const file of files) {
                try {
                    const compressedBase64 = await compressImage(file, 800, 800, 0.7);
                    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || '回忆';
                    currentModalPhotos.push({
                        src: compressedBase64,
                        title: nameWithoutExt,
                        desc: ''
                    });
                } catch (err) {
                    console.error('图片压缩失败:', err);
                    notify(`图片 ${file.name} 读取或压缩失败！`, 'error');
                }
            }
            renderModalPhotosPreview();
            timelinePhotos.value = ''; // 重置 input
        });
    }

    // 提交时光轴时刻表单
    if (timelineForm) {
        timelineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = timelineEditId.value;
            const date = document.getElementById('timelineDate').value;
            const category = document.getElementById('timelineCategory').value;
            const title = document.getElementById('timelineTitle').value.trim();
            const content = document.getElementById('timelineContent').value.trim();

            if (!date || !category || !title || !content) return;

            timelineSubmitBtn.disabled = true;
            timelineSubmitBtn.textContent = '保存中...';

            try {
                // 上传新增的本地图片到云端 OSS 或者是本机的临时上传 API
                const uploadedPhotos = [];
                for (let i = 0; i < currentModalPhotos.length; i++) {
                    const photo = currentModalPhotos[i];
                    if (photo.src.startsWith('http') || photo.src.startsWith('assets/')) {
                        uploadedPhotos.push(photo);
                    } else {
                        const result = await window.MemoryCloudApi.uploadPhoto({
                            filename: `timeline-${Date.now()}-${i}.jpg`,
                            dataUrl: photo.src
                        });
                        uploadedPhotos.push({
                            src: result.photo.url,
                            title: photo.title,
                            desc: photo.desc || content,
                            date: date
                        });
                    }
                }

                // 补充照片的基本信息以适配灯箱展示
                uploadedPhotos.forEach(photo => {
                    photo.date = date;
                    if (!photo.desc) photo.desc = content;
                });

                if (id) {
                    const response = await window.MemoryCloudApi.updateTimeline(id, {
                        date, category, title, content,
                        photos: uploadedPhotos
                    });
                    const idx = timelineData.findIndex(t => t.id === id);
                    if (idx !== -1) {
                        timelineData[idx] = response.timeline;
                    }
                } else {
                    const response = await window.MemoryCloudApi.createTimeline({
                        date, category, title, content,
                        photos: uploadedPhotos
                    });
                    timelineData.push(response.timeline);
                }

                renderTimeline();
                closeModal(timelineModal);
            } catch (err) {
                notify('保存时光回忆失败: ' + err.message, 'error');
            } finally {
                timelineSubmitBtn.disabled = false;
                timelineSubmitBtn.textContent = id ? '保存修改' : '收入时光轴';
            }
        });
    }

    // 类别筛选
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTimeline();
        });
    });

    window.addEventListener('resize', initTimelinePolaroids);

    closeLightbox.addEventListener('click', () => closeModal(lightboxModal));

    // 点击遮罩背景关闭弹窗
    const modals = [noteModal, configModal, lightboxModal, momentModal, photoWallModal, authModal, adminModal, timelineModal];
    modals.forEach(m => {
        m.querySelector('.modal-backdrop').addEventListener('click', () => closeModal(m));
    });

    // 按 Esc 键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => {
                if (!m.classList.contains('hidden')) closeModal(m);
            });
        }
    });

    // ==========================================
    // 9. 主题切换逻辑
    // ==========================================
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            console.log('主题切换按钮被点击。当前 classList:', body.classList.toString());
            try {
                if (body.classList.contains('dark-theme')) {
                    body.classList.remove('dark-theme');
                    body.classList.add('light-theme');
                    if (sunIcon) sunIcon.style.display = 'none';
                    if (moonIcon) moonIcon.style.display = 'block';
                    localStorage.setItem('themeSetting', 'light');
                    console.log('已成功切换为浅色主题 (light-theme)。');
                } else {
                    body.classList.remove('light-theme');
                    body.classList.add('dark-theme');
                    if (sunIcon) sunIcon.style.display = 'block';
                    if (moonIcon) moonIcon.style.display = 'none';
                    localStorage.setItem('themeSetting', 'dark');
                    console.log('已成功切换为深色主题 (dark-theme)。');
                }
            } catch (err) {
                console.error('主题切换过程中发生错误:', err);
            }
        });
    } else {
        console.error('未找到主题切换按钮 themeToggleBtn！');
    }

    // ==========================================
    // 10. 浮光粒子背景系统 (HTML5 Canvas Background)
    // ==========================================
    function initParticles() {
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');

        // 强制禁用图片平滑处理以保持像素清晰锐利
        ctx.imageSmoothingEnabled = false;

        // 预加载星露谷物语像素素材
        const junimoImg = new Image();
        junimoImg.src = 'assets/sv_junimo.gif';
        const stardropImg = new Image();
        stardropImg.src = 'assets/sv_stardrop.png';

        let particles = [];
        const maxParticles = 40; // 适当减少粒子上限以优化多变色滤镜的渲染效率

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // 每次大小变化时重新设定，以保持非平滑状态
            ctx.imageSmoothingEnabled = false;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // 辅助绘制高清晰度像素红心（避免额外的图片加载）
        function drawPixelHeart(ctx, x, y, size, color) {
            ctx.save();
            ctx.fillStyle = color;
            const grid = [
                [0,1,1,0,0,1,1,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,0,0,0,0,0]
            ];
            const pixelSize = size / 8;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (grid[r][c] === 1) {
                        ctx.fillRect(x + (c - 4) * pixelSize, y + (r - 4) * pixelSize, pixelSize + 0.1, pixelSize + 0.1);
                    }
                }
            }
            ctx.restore();
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                // 从屏幕底部下方开始向上飘起
                this.y = Math.random() * canvas.height + canvas.height;
                
                // 随机决定粒子类别：60% 祝尼魔，20% 星之果实，20% 像素爱心
                const rand = Math.random();
                if (rand < 0.60) {
                    this.type = 'junimo';
                    this.size = Math.random() * 10 + 10; // 祝尼魔尺寸 10px-20px
                } else if (rand < 0.80) {
                    this.type = 'stardrop';
                    this.size = Math.random() * 8 + 8;   // 星之果实尺寸 8px-16px
                } else {
                    this.type = 'heart';
                    this.size = Math.random() * 8 + 6;   // 像素心尺寸 6px-14px
                }

                this.speedY = Math.random() * 0.4 + 0.15; // 缓慢飘移速度

                // 左右摆动参数（模仿星露谷精灵特有的在空中飘摇动作）
                this.swingSpeed = Math.random() * 0.015 + 0.01;
                this.swingRange = Math.random() * 1.2 + 0.4;
                this.swingOffset = Math.random() * Math.PI * 2;

                this.opacity = Math.random() * 0.4 + 0.15; // 微微闪烁的半透明质感
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = Math.random() * 0.012 - 0.006;
                this.hue = Math.random() * 360; // 随机的色调偏转
            }

            update() {
                this.y -= this.speedY;
                // 添加左右正弦波飘摆
                this.x += Math.sin(this.y * this.swingSpeed + this.swingOffset) * this.swingRange * 0.2;
                this.rotation += this.rotSpeed;

                // 边缘处理
                if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
                    this.reset();
                    this.y = canvas.height + 30;
                }
            }

            draw() {
                ctx.save();
                
                // 获取当前主题
                const isLightTheme = document.body.classList.contains('light-theme');
                const heartColor = isLightTheme ? `rgba(211, 122, 122, ${this.opacity})` : `rgba(229, 169, 169, ${this.opacity})`;

                if (this.type === 'junimo') {
                    // 只有图片加载完成才绘制
                    if (junimoImg.complete && junimoImg.naturalWidth !== 0) {
                        ctx.globalAlpha = this.opacity;
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        // 应用星露谷祝尼魔变色
                        ctx.filter = `hue-rotate(${this.hue}deg) saturate(1.2)`;
                        ctx.drawImage(junimoImg, -this.size, -this.size, this.size * 2, this.size * 2);
                    }
                } else if (this.type === 'stardrop') {
                    if (stardropImg.complete && stardropImg.naturalWidth !== 0) {
                        ctx.globalAlpha = this.opacity;
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        ctx.drawImage(stardropImg, -this.size, -this.size, this.size * 2, this.size * 2);
                    }
                } else if (this.type === 'heart') {
                    drawPixelHeart(ctx, this.x, this.y, this.size, heartColor);
                }
                ctx.restore();
            }
        }

        // 创建粒子
        for (let i = 0; i < maxParticles; i++) {
            const p = new Particle();
            // 均匀分布在屏幕上，而不是只从底部开始
            p.y = Math.random() * canvas.height;
            particles.push(p);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();
    }

    // ==========================================
    // 🔑 身份验证与管理员面板业务逻辑
    // ==========================================

    
    let currentIdentity = null;

    function applyIdentity(identity) {
        currentIdentity = identity;
        const isEditor = !!identity && (identity.role === 'editor' || identity.role === 'admin');
        const isAdmin = !!identity && identity.role === 'admin';
        
        body.classList.toggle('is-editor', isEditor);
        body.classList.toggle('is-admin', isAdmin);
        
        editModeBtn.classList.toggle('hidden', !!identity);
        logoutEditBtn.classList.toggle('hidden', !identity);
        
        // 留言板署名预填
        const authorNameInput = document.getElementById('authorName');
        if (identity) {
            authorNameInput.value = identity.displayName || (identity.role === 'admin' ? '管理员' : '编辑者');
            authorNameInput.disabled = true;
        } else {
            authorNameInput.value = '';
            authorNameInput.disabled = false;
        }
    }

    async function restoreIdentity() {
        if (!window.MemoryCloudAuth.getToken()) return;
        try {
            applyIdentity(await window.MemoryCloudApi.me());
        } catch (err) {
            console.warn('恢复登录身份失败:', err);
            window.MemoryCloudAuth.clearToken();
            applyIdentity(null);
        }
    }

    // 云端数据读取同步
    async function loadCloudData() {
        try {
            const configResult = await window.MemoryCloudApi.getConfig();
            const cloudConfig = configResult.config || {};
            partnerName = cloudConfig.partnerName || partnerName;
            anniversaryStr = cloudConfig.anniversaryDate || anniversaryStr;
            
            // 更新 UI
            partnerNameSpan.textContent = partnerName;
            anniversaryDisplay.textContent = formatDateCN(anniversaryStr);
            partnerNameInput.value = partnerName;
            anniversaryInput.value = anniversaryStr;
            updateLiveCounter();
            updateMilestoneCard();
        } catch (err) {
            console.warn('读取云端配置失败，使用默认配置:', err);
        }

        try {
            const notesResult = await window.MemoryCloudApi.getNotes();
            notes = notesResult.notes.map(n => ({
                id: n.id,
                author: n.authorName,
                text: n.text,
                color: n.color,
                date: n.createdAt.slice(0, 10),
                authorId: n.authorId
            }));
            renderNotes();
        } catch (err) {
            console.warn('读取云端留言失败，显示空留言:', err);
            notes = defaultNotes;
            renderNotes();
        }

        try {
            const momentsResult = await window.MemoryCloudApi.getMoments();
            moments = momentsResult.moments;
            renderMoments();
        } catch (err) {
            console.warn('读取云端瞬间失败，显示空瞬间:', err);
            moments = defaultMoments;
            renderMoments();
        }

        try {
            const timelineResult = await window.MemoryCloudApi.getTimeline();
            timelineData = timelineResult.timeline;
        } catch (err) {
            console.warn('读取云端时光轴失败，显示空时光轴:', err);
            timelineData = defaultTimeline;
        }

        try {
            const photoWallResult = await window.MemoryCloudApi.getPhotoWall();
            photoWallPhotos = photoWallResult.photos;
        } catch (err) {
            console.warn('读取云端照片墙失败，显示空照片墙:', err);
            photoWallPhotos = defaultPhotoWall;
        }
        
        // 动态渲染时光轴
        renderTimeline();
        renderPhotoWall();
    }

    // 绑定弹窗控制
    console.log('正在初始化弹窗事件绑定...');
    if (editModeBtn && authModal) {
        console.log('成功获取 editModeBtn 和 authModal，开始绑定 click 事件。');
        editModeBtn.addEventListener('click', () => {
            console.log('editModeBtn 被点击，执行 openModal(authModal)');
            openModal(authModal);
        });
    } else {
        console.error('获取 editModeBtn 或 authModal 失败！editModeBtn:', editModeBtn, 'authModal:', authModal);
    }
    
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => closeModal(authModal));
    }
    
    if (adminPanelBtn && adminModal) {
        adminPanelBtn.addEventListener('click', () => {
            loadAdminPanelData();
            openModal(adminModal);
        });
    }
    
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', () => closeModal(adminModal));
    }

    if (logoutEditBtn) {
        logoutEditBtn.addEventListener('click', () => {
            window.MemoryCloudAuth.clearToken();
            applyIdentity(null);
            loadCloudData();
        });
    }

    // 登录提交
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const secret = authSecret.value.trim();
        const type = authType.value;
        const submitBtn = authForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '验证中...';

        try {
            const result = type === 'admin'
                ? await window.MemoryCloudApi.adminLogin(secret)
                : await window.MemoryCloudApi.claimInvite(secret);
            
            window.MemoryCloudAuth.setToken(result.token);
            applyIdentity(await window.MemoryCloudApi.me());
            authForm.reset();
            closeModal(authModal);
            
            loadCloudData();
        } catch (err) {
            notify('验证失败: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '确认进入';
        }
    });

    // 管理员：生成邀请码
    createInviteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = inviteDisplayName.value.trim();
        const submitBtn = createInviteForm.querySelector('.submit-btn');
        submitBtn.disabled = true;

        try {
            const result = await window.MemoryCloudApi.createInvite(name);
            newInviteCode.textContent = result.code;
            createdInviteResult.classList.remove('hidden');
            inviteDisplayName.value = '';
            loadAdminPanelData();
        } catch (err) {
            notify('生成失败: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // 加载管理员控制面板列表数据
    async function loadAdminPanelData() {
        if (!currentIdentity || currentIdentity.role !== 'admin') return;
        adminDataList.innerHTML = '<div style="font-size: 12px; opacity:0.8; text-align:center;">加载中...</div>';
        
        try {
            const invitesResult = await window.MemoryCloudApi.listInvites();
            const editorsResult = await window.MemoryCloudApi.listEditors();
            adminDataList.innerHTML = '';
            
            if (editorsResult.editors && editorsResult.editors.length) {
                const title = document.createElement('h5');
                title.textContent = '已激活的编辑者';
                title.style.margin = '10px 0 5px 0';
                title.style.fontSize = '12px';
                title.style.color = 'var(--accent-color)';
                adminDataList.appendChild(title);
                
                editorsResult.editors.forEach(ed => {
                    const item = document.createElement('div');
                    item.className = 'admin-data-item';
                    item.innerHTML = `
                        <span>👤 <strong>${escapeHTML(ed.displayName)}</strong> (${ed.status === 'active' ? '活动中' : '已撤销'})</span>
                        ${ed.status === 'active' ? `<button class="revoke-btn" data-type="editor" data-id="${ed.id}">撤销</button>` : ''}
                    `;
                    adminDataList.appendChild(item);
                });
            }

            if (invitesResult.invites && invitesResult.invites.length) {
                const title = document.createElement('h5');
                title.textContent = '未使用/已失效的邀请码';
                title.style.margin = '15px 0 5px 0';
                title.style.fontSize = '12px';
                title.style.color = 'var(--accent-color)';
                adminDataList.appendChild(title);

                invitesResult.invites.forEach(inv => {
                    const item = document.createElement('div');
                    item.className = 'admin-data-item';
                    let statusText = inv.status === 'unused' ? '未使用' : (inv.status === 'used' ? '已使用' : '已失效');
                    const codeDisplay = inv.code ? ` (邀请码: <code style="color:var(--accent-color); background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-family:monospace; font-weight:bold; font-size:13px;">${escapeHTML(inv.code)}</code>)` : '';
                    item.innerHTML = `
                        <span>🔑 <strong>${escapeHTML(inv.displayName)}</strong>${codeDisplay} (${statusText})</span>
                        ${inv.status === 'unused' ? `<button class="revoke-btn" data-type="invite" data-id="${inv.id}">失效</button>` : ''}
                    `;
                    adminDataList.appendChild(item);
                });
            }

            if (adminDataList.children.length === 0) {
                adminDataList.innerHTML = '<div style="font-size: 12px; opacity:0.6; text-align:center;">暂无记录</div>';
            }

            const revokeBtns = adminDataList.querySelectorAll('.revoke-btn');
            revokeBtns.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const type = btn.getAttribute('data-type');
                    const id = btn.getAttribute('data-id');
                    btn.disabled = true;
                    btn.textContent = '操作中...';
                    try {
                        if (type === 'editor') {
                            await window.MemoryCloudApi.revokeEditor(id);
                        } else {
                            await window.MemoryCloudApi.revokeInvite(id);
                        }
                        loadAdminPanelData();
                    } catch (err) {
                        notify('操作失败: ' + err.message, 'error');
                        btn.disabled = false;
                        btn.textContent = type === 'editor' ? '撤销' : '失效';
                    }
                });
            });

        } catch (err) {
            adminDataList.innerHTML = `<div style="font-size: 12px; color:#E57373; text-align:center;">加载失败: ${err.message}</div>`;
        }
    }

    // 顶栏导航高亮逻辑 (Active Class Switching on Click & Scroll)
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    function updateActiveNav() {
        let currentSection = sections[0];
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        for (const section of sections) {
            if (scrollPosition >= section.offsetTop) {
                currentSection = section;
            }
        }

        if (currentSection) {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentSection.id}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    // 监听滚动与初始化调用
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // 点击链接时立即激活高亮
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(b => b.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 移动端导航栏展开/收起逻辑
    const logoMenuToggle = document.getElementById('logoMenuToggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (logoMenuToggle && navLinksContainer) {
        const toggleMenu = (e) => {
            if (window.innerWidth <= 900) {
                e.stopPropagation();
                const isOpen = navLinksContainer.classList.toggle('mobile-show');
                logoMenuToggle.classList.toggle('menu-active', isOpen);
                logoMenuToggle.setAttribute('aria-expanded', isOpen);
            }
        };

        logoMenuToggle.addEventListener('click', toggleMenu);
        
        // 支持键盘回车/空格触发
        logoMenuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu(e);
            }
        });

        // 点击外部收起菜单
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && navLinksContainer.classList.contains('mobile-show')) {
                if (!navLinksContainer.contains(e.target) && !logoMenuToggle.contains(e.target)) {
                    navLinksContainer.classList.remove('mobile-show');
                    logoMenuToggle.classList.remove('menu-active');
                    logoMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // 点击导航链接后自动收起菜单
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    navLinksContainer.classList.remove('mobile-show');
                    logoMenuToggle.classList.remove('menu-active');
                    logoMenuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});
