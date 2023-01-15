import { ArrowRightOutlined } from '@ant-design/icons';
import { MessageDisplay } from 'components/common';
import { ProductShowcaseGrid } from 'components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, SHOP } from 'constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from 'hooks';
import bannerImg from 'images/banner-girl.png';
import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
  useDocumentTitle('shop hrsh | Home | purchase anything!!');
  useScrollTop();

  const { 
    featuredProducts,
    fetchFeaturedProducts,
    isLoading: isLoadingFeatured,
    error: errorFeatured
  } = useFeaturedProducts(6);
  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading: isLoadingRecommended,
    error: errorRecommended
  } = useRecommendedProducts(6);

  return (
    <main className='content'>
      <div className='home'>
        <div className='banner'>
          <div className='banner-desc'>
            <h1 className='text-thin'>
              <strong>Purchase</strong>
              &nbsp;Anything from&nbsp;
              <strong>Shop Hrsh</strong>
            </h1>
            <p>
              purchase anything from small nipple to huge trucks!! anything and i mean anything u can get here!!
            </p>
            <br />
            <Link to={SHOP} className='button'>
              Shop Now &nbsp;
              <ArrowRightOutlined />
            </Link>
          </div>
          <div className='banner-img'><img src={bannerImg} alt='' /></div>
        </div>
        <div className='display'>
          <div className='display-header'>
            <h1>Featured Products</h1>
            <Link to={FEATURED_PRODUCTS}>See All</Link>
          </div>
          {(errorFeatured && !isLoadingFeatured) ? (
            <MessageDisplay
              message={errorFeatured}
              action={fetchFeaturedProducts}
              buttonLabel='Try Again'
            />
          ) : (
            <ProductShowcaseGrid
              products={featuredProducts}
              skeletonCount={6}
            />
          )}
        </div>
        <div className='display'>
          <div className='display-header'>
            <h1>Recommended Products</h1>
            <Link to={RECOMMENDED_PRODUCTS}>See All</Link>
          </div>
          {(errorRecommended && !isLoadingRecommended) ? (
            <MessageDisplay
              message={errorRecommended}
              action={fetchRecommendedProducts}
              buttonLabel='Try Again'
            />
          ) : (
            <ProductShowcaseGrid
              products={recommendedProducts}
              skeletonCount={6}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
