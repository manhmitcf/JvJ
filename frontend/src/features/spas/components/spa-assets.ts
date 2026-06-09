import calendarQuoteImage from "@/assets/phase-5b-spa-calendar/calendar-02.webp";
import spaCard01 from "@/assets/phase-5b-spa-calendar/spa-card-01.webp";
import spaCard02 from "@/assets/phase-5b-spa-calendar/spa-card-02.webp";
import spaCard03 from "@/assets/phase-5b-spa-calendar/spa-card-03.webp";
import spaCard04 from "@/assets/phase-5b-spa-calendar/spa-card-04.webp";
import spaCard05 from "@/assets/phase-5b-spa-calendar/spa-card-05.webp";
import spaCard06 from "@/assets/phase-5b-spa-calendar/spa-card-06.webp";
import spaDetail02 from "@/assets/phase-5b-spa-calendar/spa-detail-02.webp";
import spaDetail03 from "@/assets/phase-5b-spa-calendar/spa-detail-03.webp";
import spaDetail04 from "@/assets/phase-5b-spa-calendar/spa-detail-04.webp";
import spaMapImage from "@/assets/phase-5b-spa-calendar/spa-detail-05.webp";
const listingImages = [spaCard01, spaCard02, spaCard03, spaCard04, spaCard05, spaCard06];
const detailGalleryImages = [spaDetail02, spaDetail03, spaDetail04];

export function getSpaListingImage(index = 0) {
  return listingImages[index % listingImages.length] ?? listingImages[0];
}

export function getSpaGalleryImages(index = 0) {
  const primary = getSpaListingImage(index);
  return [primary, ...detailGalleryImages];
}

export function getSpaMapImage() {
  return spaMapImage;
}

export function getSpaCalendarQuoteImage() {
  return calendarQuoteImage;
}
