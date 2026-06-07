import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const cloudApiJs = readFileSync(new URL('./cloud-api.js', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

describe('independent photo wall frontend', () => {
    test('adds the photo wall to the top navigation and uses the shared centered section header', () => {
        expect(indexHtml.includes('<a href="#photo-wall">照片墙</a>')).toBe(true);
        expect(indexHtml.includes('<section id="photo-wall" class="section-container photo-wall-section"')).toBe(true);
        expect(indexHtml.includes('<div class="section-header">')).toBe(true);
        expect(indexHtml.includes('<h2 class="section-title">我们的照片墙 <span>/ Photo Wall</span></h2>')).toBe(true);
    });

    test('exposes photo wall editing only through editor-only controls', () => {
        expect(indexHtml.includes('id="addPhotoWallBtn" class="primary-btn editor-only"')).toBe(true);
        expect(indexHtml.includes('id="photoWallModal"')).toBe(true);
        expect(indexHtml.includes('id="photoWallEditId"')).toBe(true);
        expect(appJs.includes('photo-wall-actions editor-only')).toBe(true);
        expect(appJs.includes('edit-photo-wall-btn')).toBe(true);
        expect(appJs.includes('delete-photo-wall-btn')).toBe(true);
    });

    test('uses independent photo wall API methods instead of collecting timeline and moment photos', () => {
        expect(cloudApiJs.includes("getPhotoWall: () => request('/photo-wall')")).toBe(true);
        expect(cloudApiJs.includes("createPhotoWallPhoto: (photo) => request('/photo-wall'")).toBe(true);
        expect(cloudApiJs.includes("updatePhotoWallPhoto: (id, photo) => request(`/photo-wall/${id}`")).toBe(true);
        expect(cloudApiJs.includes("deletePhotoWallPhoto: (id) => request(`/photo-wall/${id}`")).toBe(true);
        expect(appJs.includes('let photoWallPhotos = []')).toBe(true);
        expect(appJs.includes('window.MemoryCloudApi.getPhotoWall()')).toBe(true);
        expect(appJs.includes('function collectPhotoWallImages()')).toBe(false);
    });

    test('sizes photo wall frames from each uploaded photo ratio', () => {
        expect(appJs.includes('function getImageRatio')).toBe(true);
        expect(appJs.includes('function normalizePhotoRatio')).toBe(true);
        expect(appJs.includes('const photoRatio = normalizePhotoRatio(photo.ratio) || pattern.ratio;')).toBe(true);
        expect(appJs.includes("photoButton.style.setProperty('--ratio', photoRatio);")).toBe(true);
        expect(appJs.includes("await getImageRatio(src)")).toBe(true);
        expect(appJs.includes('ratio }')).toBe(true);
        expect(appJs.includes('photo.ratio = naturalRatio;')).toBe(true);
    });
});
