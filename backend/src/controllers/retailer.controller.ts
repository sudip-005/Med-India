import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { supabaseAdmin } from '../config/supabase';

export class RetailerController {
  /**
   * Configures profile details for a Retailer, uploading shop image, licenses, and stock file.
   */
  static async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const retailerId = req.user!.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const updateData = { ...req.body };

      if (files) {
        if (files['business_license'] && files['business_license'][0]) {
          const file = files['business_license'][0];
          const path = `${retailerId}/business_license_${Date.now()}.${file.originalname.split('.').pop()}`;
          const storagePath = await StorageService.uploadFile('retailer-documents', path, file.buffer, file.mimetype);
          updateData.business_license_url = storagePath;
        }

        if (files['medical_license'] && files['medical_license'][0]) {
          const file = files['medical_license'][0];
          const path = `${retailerId}/medical_license_${Date.now()}.${file.originalname.split('.').pop()}`;
          const storagePath = await StorageService.uploadFile('retailer-documents', path, file.buffer, file.mimetype);
          updateData.medical_license_url = storagePath;
        }

        if (files['gst_certificate'] && files['gst_certificate'][0]) {
          const file = files['gst_certificate'][0];
          const path = `${retailerId}/gst_certificate_${Date.now()}.${file.originalname.split('.').pop()}`;
          const storagePath = await StorageService.uploadFile('retailer-documents', path, file.buffer, file.mimetype);
          updateData.gst_certificate_url = storagePath;
        }

        if (files['stock_file'] && files['stock_file'][0]) {
          const file = files['stock_file'][0];
          const path = `${retailerId}/stock_${Date.now()}.${file.originalname.split('.').pop()}`;
          const storagePath = await StorageService.uploadFile('stock-files', path, file.buffer, file.mimetype);
          updateData.stock_file_url = storagePath;
        }

        if (files['shop_image'] && files['shop_image'][0]) {
          const file = files['shop_image'][0];
          const path = `${retailerId}/shop_${Date.now()}.${file.originalname.split('.').pop()}`;
          const storagePath = await StorageService.uploadFile('profile-images', path, file.buffer, file.mimetype);
          updateData.shop_image_url = StorageService.getPublicUrl('profile-images', storagePath);
        }
      }

      const profile = await AuthService.updateProfile(retailerId, 'RETAILER', updateData);
      return res.status(200).json({
        message: 'Retailer profile updated successfully',
        profile,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Updates text properties in a Retailer's profile.
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const retailerId = req.user!.id;
      const profile = await AuthService.updateProfile(retailerId, 'RETAILER', req.body);
      return res.status(200).json({
        message: 'Retailer profile updated successfully',
        profile,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Retrieves all active Retailers.
   */
  static async getRetailers(req: Request, res: Response, next: NextFunction) {
    try {
      const { data: retailers, error } = await supabaseAdmin
        .from('retailers')
        .select('*')
        .eq('is_active', true);

      if (error) throw new Error(error.message);

      // Generate temporary signed URLs for documents and files
      const processedRetailers = await Promise.all(
        (retailers || []).map(async (ret) => {
          let busUrl = null;
          let medUrl = null;
          let gstUrl = null;
          let stockUrl = null;

          if (ret.business_license_url) {
            busUrl = await StorageService.getSignedUrl('retailer-documents', ret.business_license_url).catch(() => null);
          }
          if (ret.medical_license_url) {
            medUrl = await StorageService.getSignedUrl('retailer-documents', ret.medical_license_url).catch(() => null);
          }
          if (ret.gst_certificate_url) {
            gstUrl = await StorageService.getSignedUrl('retailer-documents', ret.gst_certificate_url).catch(() => null);
          }
          if (ret.stock_file_url) {
            stockUrl = await StorageService.getSignedUrl('stock-files', ret.stock_file_url).catch(() => null);
          }

          return {
            ...ret,
            business_license_signed_url: busUrl,
            medical_license_signed_url: medUrl,
            gst_certificate_signed_url: gstUrl,
            stock_file_signed_url: stockUrl,
          };
        })
      );

      return res.status(200).json(processedRetailers);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Retrieves a single Retailer by ID.
   */
  static async getRetailerById(req: Request, res: Response, next: NextFunction) {
    try {
      const retailerId = req.params.id;
      const retailer = await AuthService.getProfile(retailerId, 'RETAILER');

      let busUrl = null;
      let medUrl = null;
      let gstUrl = null;
      let stockUrl = null;

      if (retailer.business_license_url) {
        busUrl = await StorageService.getSignedUrl('retailer-documents', retailer.business_license_url).catch(() => null);
      }
      if (retailer.medical_license_url) {
        medUrl = await StorageService.getSignedUrl('retailer-documents', retailer.medical_license_url).catch(() => null);
      }
      if (retailer.gst_certificate_url) {
        gstUrl = await StorageService.getSignedUrl('retailer-documents', retailer.gst_certificate_url).catch(() => null);
      }
      if (retailer.stock_file_url) {
        stockUrl = await StorageService.getSignedUrl('stock-files', retailer.stock_file_url).catch(() => null);
      }

      return res.status(200).json({
        ...retailer,
        business_license_signed_url: busUrl,
        medical_license_signed_url: medUrl,
        gst_certificate_signed_url: gstUrl,
        stock_file_signed_url: stockUrl,
      });
    } catch (err) {
      return next(err);
    }
  }
}
