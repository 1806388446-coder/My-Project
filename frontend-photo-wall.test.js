import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const cloudApiJs = readFileSync(new URL('./cloud-api.js', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

describe('independent photo wall frontend', () => {
    test('adds the photo wall to the top navigation and uses the shared centered section header', () => {
        assert.ok(indexHtml.includes('<a href="#photo-wall">照片墙</a>'));
        assert.ok(indexHtml.includes('<section id="photo-wall" class="section-container photo-wall-section"'));
        assert.ok(indexHtml.includes('<div class="section-header">'));
        assert.ok(indexHtml.includes('<h2 class="section-title">我们的照片墙 <span>/ Photo Wall</span></h2>'));
    });

    test('exposes photo wall editing only through editor-only controls', () => {
        assert.ok(indexHtml.includes('id="addPhotoWallBtn" class="primary-btn editor-only"'));
        assert.ok(indexHtml.includes('id="photoWallModal"'));
        assert.ok(indexHtml.includes('id="photoWallEditId"'));
        assert.ok(appJs.includes('photo-wall-actions editor-only'));
        assert.ok(appJs.includes('edit-photo-wall-btn'));
        assert.ok(appJs.includes('delete-photo-wall-btn'));
    });

    test('uses independent photo wall API methods instead of collecting timeline and moment photos', () => {
        assert.ok(cloudApiJs.includes("getPhotoWall: () => request('/photo-wall')"));
        assert.ok(cloudApiJs.includes("createPhotoWallPhoto: (photo) => request('/photo-wall'"));
        assert.ok(cloudApiJs.includes("updatePhotoWallPhoto: (id, photo) => request(`/photo-wall/${id}`"));
        assert.ok(cloudApiJs.includes("deletePhotoWallPhoto: (id) => request(`/photo-wall/${id}`"));
        assert.ok(appJs.includes('let photoWallPhotos = []'));
        assert.ok(appJs.includes('window.MemoryCloudApi.getPhotoWall()'));
        assert.equal(appJs.includes('function collectPhotoWallImages()'), false);
    });

    test('sizes photo wall frames from each uploaded photo ratio', () => {
        assert.ok(appJs.includes('function getImageRatio'));
        assert.ok(appJs.includes('function normalizePhotoRatio'));
        assert.ok(appJs.includes('const photoRatio = normalizePhotoRatio(photo.ratio) || pattern.ratio;'));
        assert.ok(appJs.includes("photoButton.style.setProperty('--ratio', photoRatio);"));
        assert.ok(appJs.includes("await getImageRatio(src)"));
        assert.ok(appJs.includes('ratio }'));
        assert.ok(appJs.includes('photo.ratio = naturalRatio;'));
    });
});
