'use client'

import dynamic from 'next/dynamic'

export const PropertyMap = dynamic(() => import('./propertyMapCanvas'), {ssr: false})
