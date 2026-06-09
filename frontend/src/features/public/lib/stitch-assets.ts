import homeHeroImage from "@/assets/public-discovery/stitch-generated/webp/home-01.webp";
import therapistProfileImage from "@/assets/public-discovery/stitch-generated/webp/therapist-detail-01.webp";
import therapistSupportImage from "@/assets/public-discovery/stitch-generated/webp/therapist-detail-02.webp";
import treatmentDetailHeroImage from "@/assets/public-discovery/stitch-generated/webp/treatment-detail-01.webp";
import treatmentDetailGalleryOneImage from "@/assets/public-discovery/stitch-generated/webp/treatment-detail-02.webp";
import treatmentDetailGalleryTwoImage from "@/assets/public-discovery/stitch-generated/webp/treatment-detail-03.webp";
import treatmentDetailGalleryThreeImage from "@/assets/public-discovery/stitch-generated/webp/treatment-detail-04.webp";
import treatmentDetailGalleryFourImage from "@/assets/public-discovery/stitch-generated/webp/treatment-detail-05.webp";
import treatmentListingOneImage from "@/assets/public-discovery/stitch-generated/webp/treatments-listing-01.webp";
import treatmentListingTwoImage from "@/assets/public-discovery/stitch-generated/webp/treatments-listing-02.webp";
import treatmentListingThreeImage from "@/assets/public-discovery/stitch-generated/webp/treatments-listing-03.webp";
import treatmentListingFourImage from "@/assets/public-discovery/stitch-generated/webp/treatments-listing-04.webp";

const treatmentCardImages: Record<string, string> = {
  "treatment-1": treatmentListingOneImage,
  "treatment-2": treatmentListingTwoImage,
  "treatment-3": treatmentListingThreeImage,
};

const therapistCardImages: Record<string, string> = {
  "therapist-1": therapistProfileImage,
  "therapist-pending-1": therapistSupportImage,
};

export const publicStitchAssets = {
  homeHero: homeHeroImage,
  listingHero: treatmentListingFourImage,
  treatmentDetailHero: treatmentDetailHeroImage,
  treatmentDetailGallery: [
    treatmentDetailGalleryOneImage,
    treatmentDetailGalleryTwoImage,
    treatmentDetailGalleryThreeImage,
    treatmentDetailGalleryFourImage,
  ],
  therapistDetailHero: therapistProfileImage,
  therapistSupport: therapistSupportImage,
  treatmentCardImages,
  therapistCardImages,
};

export function getTreatmentStitchImage(treatmentId: string, fallbackImage: string) {
  return publicStitchAssets.treatmentCardImages[treatmentId] ?? fallbackImage;
}

export function getTherapistStitchImage(therapistId: string, fallbackImage: string) {
  return publicStitchAssets.therapistCardImages[therapistId] ?? fallbackImage;
}
