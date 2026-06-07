(function () {
    function init({ trackList, initialIndex = 0 }) {
        const audioSource = document.getElementById('audioSource');
        const playBtn = document.getElementById('playBtn');
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playerDisc = document.getElementById('playerDisc');
        const playerDiscCenter = document.querySelector('.disc-center');
        const trackTitle = document.getElementById('trackTitle');
        const playlistDropdown = document.getElementById('playlistDropdown');
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeIcon = document.getElementById('volumeIcon');
        const playModeBtn = document.getElementById('playModeBtn');
        const loopListIcon = document.getElementById('loopListIcon');
        const loopSingleIcon = document.getElementById('loopSingleIcon');

        if (!audioSource || !playBtn || !trackTitle || !Array.isArray(trackList) || trackList.length === 0) {
            return { setTrack() {}, playTrack() {} };
        }

        let currentTrackIdx = initialIndex;
        let playMode = 'list';
        let lastVolume = 0.8;

        function setPlaybackUI(isPlaying) {
            if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
            if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
            if (playerDisc) playerDisc.classList.toggle('playing', isPlaying);
        }

        function setTrack(idx) {
            currentTrackIdx = idx;
            audioSource.src = trackList[idx].src;
            trackTitle.textContent = trackList[idx].name;
            if (playerDiscCenter && trackList[idx].cover) {
                playerDiscCenter.style.backgroundImage = `url('${trackList[idx].cover}')`;
            }
            renderPlaylist();
        }

        function renderPlaylist() {
            if (!playlistDropdown) return;
            playlistDropdown.innerHTML = '';
            trackList.forEach((track, index) => {
                const item = document.createElement('div');
                item.className = 'playlist-item' + (index === currentTrackIdx ? ' active' : '');
                item.textContent = `${index + 1}. ${track.name}`;
                item.title = track.name;
                item.setAttribute('role', 'button');
                item.setAttribute('aria-current', index === currentTrackIdx ? 'true' : 'false');
                item.addEventListener('click', () => playTrack(index));
                playlistDropdown.appendChild(item);
            });
        }

        function playTrack(idx) {
            setTrack(idx);
            audioSource.play().then(() => {
                setPlaybackUI(true);
            }).catch(err => {
                console.log('播放被拦截：', err);
                window.MemoryFeedback?.showToast('浏览器拦截了播放，请再点一次播放按钮', 'info');
            });
        }

        function togglePlay() {
            if (audioSource.paused) {
                audioSource.play().then(() => {
                    setPlaybackUI(true);
                }).catch(err => {
                    console.log('自动播放可能被浏览器静音策略拦截，需用户手动点击播放：', err);
                    window.MemoryFeedback?.showToast('浏览器需要你手动点一下播放', 'info');
                });
            } else {
                audioSource.pause();
                setPlaybackUI(false);
            }
        }

        function updateVolumeIcon(vol) {
            if (!volumeIcon) return;
            if (vol === 0) {
                volumeIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
            } else if (vol < 0.5) {
                volumeIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
            } else {
                volumeIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
            }
        }

        audioSource.volume = 0.8;
        setTrack(currentTrackIdx);
        audioSource.load();
        audioSource.addEventListener('play', () => setPlaybackUI(true));
        audioSource.addEventListener('pause', () => setPlaybackUI(false));
        playBtn.addEventListener('click', togglePlay);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prevIdx = currentTrackIdx - 1 < 0 ? trackList.length - 1 : currentTrackIdx - 1;
                playTrack(prevIdx);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                playTrack((currentTrackIdx + 1) % trackList.length);
            });
        }

        if (playModeBtn) {
            playModeBtn.addEventListener('click', () => {
                playMode = playMode === 'list' ? 'single' : 'list';
                audioSource.loop = playMode === 'single';
                if (loopListIcon) loopListIcon.style.display = playMode === 'list' ? 'block' : 'none';
                if (loopSingleIcon) loopSingleIcon.style.display = playMode === 'single' ? 'block' : 'none';
                playModeBtn.title = playMode === 'single' ? '单曲循环' : '列表循环';
                playModeBtn.setAttribute('aria-label', `播放模式：${playMode === 'single' ? '单曲循环' : '列表循环'}`);
            });
        }

        audioSource.addEventListener('ended', () => {
            if (playMode === 'list') {
                playTrack((currentTrackIdx + 1) % trackList.length);
            } else {
                audioSource.play();
            }
        });

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (event) => {
                const vol = parseFloat(event.target.value);
                audioSource.volume = vol;
                updateVolumeIcon(vol);
            });
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (audioSource.volume > 0) {
                    lastVolume = audioSource.volume;
                    audioSource.volume = 0;
                    if (volumeSlider) volumeSlider.value = 0;
                    updateVolumeIcon(0);
                } else {
                    audioSource.volume = lastVolume;
                    if (volumeSlider) volumeSlider.value = lastVolume;
                    updateVolumeIcon(lastVolume);
                }
            });
        }

        return { setTrack, playTrack };
    }

    window.MemoryMusicPlayer = { init };
})();
