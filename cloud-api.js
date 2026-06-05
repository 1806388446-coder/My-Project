(function () {
  const config = window.MEMORY_CLOUD_CONFIG || {};
  const apiBaseUrl = config.apiBaseUrl || '';

  async function request(path, options = {}) {
    const token = window.MemoryCloudAuth.getToken();
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    // 对于 204 No Content，没有 body
    if (response.status === 204) {
      return null;
    }

    const body = await response.json();
    if (!response.ok) {
      const error = new Error(body.error || '请求失败');
      error.status = response.status;
      throw error;
    }
    return body;
  }

  window.MemoryCloudApi = {
    getConfig: () => request('/config'),
    updateConfig: (cfg) => request('/config', { method: 'PATCH', body: cfg }),
    
    getNotes: () => request('/notes'),
    createNote: (note) => request('/notes', { method: 'POST', body: note }),
    deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

    getMoments: () => request('/moments'),
    createMoment: (moment) => request('/moments', { method: 'POST', body: moment }),
    updateMoment: (id, moment) => request(`/moments/${id}`, { method: 'PATCH', body: moment }),
    deleteMoment: (id) => request(`/moments/${id}`, { method: 'DELETE' }),

    getTimeline: () => request('/timeline'),
    createTimeline: (item) => request('/timeline', { method: 'POST', body: item }),
    updateTimeline: (id, item) => request(`/timeline/${id}`, { method: 'PATCH', body: item }),
    deleteTimeline: (id) => request(`/timeline/${id}`, { method: 'DELETE' }),

    getPhotoWall: () => request('/photo-wall'),
    createPhotoWallPhoto: (photo) => request('/photo-wall', { method: 'POST', body: photo }),
    updatePhotoWallPhoto: (id, photo) => request(`/photo-wall/${id}`, { method: 'PATCH', body: photo }),
    deletePhotoWallPhoto: (id) => request(`/photo-wall/${id}`, { method: 'DELETE' }),

    adminLogin: (password) => request('/auth/admin/login', { method: 'POST', body: { password } }),
    claimInvite: (code) => request('/auth/invite/claim', { method: 'POST', body: { code } }),
    me: () => request('/auth/me'),

    uploadPhoto: (photo) => request('/uploads/photos', { method: 'POST', body: photo }),

    // 管理接口
    createInvite: (displayName) => request('/admin/invites', { method: 'POST', body: { displayName } }),
    listInvites: () => request('/admin/invites'),
    revokeInvite: (id) => request(`/admin/invites/${id}/revoke`, { method: 'POST' }),
    listEditors: () => request('/admin/editors'),
    revokeEditor: (id) => request(`/admin/editors/${id}/revoke`, { method: 'POST' })
  };
})();
