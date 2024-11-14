import { Ads} from '../models/index.js';

export const getAds = async (req, res) => {
    try {
        const ads = await Ads.findAll();
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los anuncios' });
    }
};

export const getAd = async (req, res) => {
    try {
        const ad = await Ads.findByPk(req.params.id);
        res.status(200).json(ad);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el anuncio' });
    }
};

export const createAd = async (req, res) => {
    try {
        const { title, description, startDate, endDate, imageUrl, companyName, websiteUrl } = req.body;
        if (!title || !description || !startDate || !endDate || !imageUrl || !companyName || !websiteUrl) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const ad = await Ads.create(req.body);
        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el anuncio' });
    }
};