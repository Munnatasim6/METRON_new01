import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Metron - Advanced Trading Dashboard',
  name = 'Metron',
  type = 'website',
}) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>
        {title} | {name}
      </title>
      <meta name='description' content={description} />

      {/* Facebook tags */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />

      {/* Twitter tags */}
      <meta name='twitter:creator' content={name} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
    </Helmet>
  );
};

export default SEO;
