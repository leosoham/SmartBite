const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

const PY_BASE = process.env.PY_AI_BASE || 'http://localhost:8085';

router.post('/analyze', async (req, res) => {
	try {
		console.log('Proxying to Python service:', `${PY_BASE}/api/analyze`);
		console.log('Request body:', JSON.stringify(req.body, null, 2));
		const resp = await axios.post(`${PY_BASE}/api/analyze`, req.body, {
			timeout: 15000,
			headers: { 'Content-Type': 'application/json' }
		});
		console.log('Python service response status:', resp.status);
		return res.status(resp.status).json(resp.data);
	} catch (err) {
		console.error('Error calling Python service:', err.message);
		if (err.response) {
			console.error('Response status:', err.response.status);
			console.error('Response data:', err.response.data);
		}
		if (err.code === 'ECONNREFUSED') {
			return res.status(503).json({ 
				error: 'service_unavailable', 
				detail: 'Python NLP service is not running on port 8085. Please start it with: npm run dev:py' 
			});
		}
		const status = err.response?.status || 500;
		return res.status(status).json({ 
			error: 'analyze_failed', 
			detail: err.message,
			response: err.response?.data 
		});
	}
});

router.post('/analyze-multipart', async (req, res) => {
	try {
		if (!req.files || !req.files.image) {
			return res.status(400).json({ error: 'image_required' });
		}
		const image = req.files.image;
		const form = new FormData();
		if (req.body.barcode) form.append('barcode', req.body.barcode);
		form.append('language', 'en');
		form.append('aggressiveness', 'balanced');
		form.append('image', image.data, { filename: image.name, contentType: image.mimetype });

		const resp = await axios.post(`${PY_BASE}/api/analyze-multipart`, form, {
			timeout: 20000,
			headers: form.getHeaders()
		});
		return res.status(resp.status).json(resp.data);
	} catch (err) {
		const status = err.response?.status || 500;
		return res.status(status).json({ error: 'analyze_multipart_failed', detail: err.message });
	}
});

module.exports = router;

