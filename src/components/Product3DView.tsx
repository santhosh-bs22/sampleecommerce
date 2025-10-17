import React from 'react';
import Tridi from 'react-tridi';
import 'react-tridi/dist/index.css';

interface Product3DViewProps {
  images: string[];
}

const Product3DView: React.FC<Product3DViewProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return null;
  }

  // Assuming the images are named in a sequence, e.g., 1.jpg, 2.jpg, etc.
  // The 'location' prop will point to the directory containing the images.
  // The 'count' will be the number of images.
  const imageLocation = new URL(images[0]).pathname.substring(0, new URL(images[0]).pathname.lastIndexOf('/'));
  const imageFormat = images[0].split('.').pop();


  return (
    <div className="w-full">
      <Tridi location={imageLocation} format={imageFormat} count={images.length} />
    </div>
  );
};

export default Product3DView;