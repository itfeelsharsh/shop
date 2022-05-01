/* eslint-disable react/forbid-prop-types */
import { FeaturedProduct } from 'components/product';
import PropType from 'prop-types';
import React from 'react';

const ProductShowcase = ({ products, skeletonCount }) => (
  <div className='product-display-grid'>
    {(products.length === 0) ? new Array(skeletonCount).fill({}).map((product, index) => (
      <FeaturedProduct
        key={`product-skeleton ${index}`}
        product={product}
      />
    )) : products.map((product) => (
      <FeaturedProduct
        key={product.id}
        product={product}
      />
    ))}
  </div>
);

ProductShowcase.defaultProps = {
  skeletonCount: 4
};

ProductShowcase.propTypes = {
  products: PropType.array.isRequired,
  skeletonCount: PropType.number
};

export default ProductShowcase;
