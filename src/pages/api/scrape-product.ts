// Next.js API route for scraping product information
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

// Define response type
type ResponseData = {
  success: boolean
  message?: string
  data?: any
  error?: string
}

// Create directory if it doesn't exist
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

// Ensure the downloads directory exists
async function ensureDownloadsDirectory() {
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads')
  await mkdir(downloadsDir, { recursive: true })
  return downloadsDir
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Please use POST.' })
  }

  try {
    // Ensure downloads directory exists
    await ensureDownloadsDirectory()
    
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required in the request body' })
    }

    // Connect to browserless.io
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
    })

    const page = await browser.newPage()
    
    // Set a user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' })

    // Extract product information
    const productData = await page.evaluate(() => {
      // This function runs in the browser context
      // Adjust the selectors based on the website structure
      const productInfo: any = {}
      
      // Common selectors for product information (adjust as needed)
      productInfo.title = document.querySelector('h1')?.textContent?.trim() || ''
      
      // Try to find price (different websites use different selectors)
      const priceSelectors = [
        '.price', 
        '[data-testid="price"]', 
        '.product-price', 
        '.price-box',
        '[itemprop="price"]'
      ]
      
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector)
        if (priceElement && priceElement.textContent) {
          productInfo.price = priceElement.textContent.trim()
          break
        }
      }
      
      // Try to find product description
      const descriptionSelectors = [
        '.product-description', 
        '[itemprop="description"]', 
        '.description',
        '#description'
      ]
      
      for (const selector of descriptionSelectors) {
        const descElement = document.querySelector(selector)
        if (descElement && descElement.textContent) {
          productInfo.description = descElement.textContent.trim()
          break
        }
      }
      
      // Get specifications (usually in a table or list)
      const specSelectors = [
        '.specifications', 
        '.product-specs', 
        '.tech-specs',
        '.product-attributes',
        '[data-testid="specifications"]'
      ]
      
      productInfo.specifications = {}
      
      for (const selector of specSelectors) {
        const specElement = document.querySelector(selector)
        if (specElement) {
          // Try to find spec rows (usually in a table)
          const rows = specElement.querySelectorAll('tr, .spec-row, .attribute-row')
          
          if (rows.length > 0) {
            Array.from(rows).forEach(row => {
              const label = row.querySelector('th, .label, .spec-name')?.textContent?.trim()
              const value = row.querySelector('td, .value, .spec-value')?.textContent?.trim()
              
              if (label && value) {
                productInfo.specifications[label] = value
              }
            })
            break
          }
        }
      }
      
      // Get all product images
      const imageElements = document.querySelectorAll('img.product-image, .product-gallery img, [data-testid="product-image"]')
      productInfo.images = []
      
      imageElements.forEach(img => {
        const src = (img as HTMLImageElement).src
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          productInfo.images.push(src)
        }
      })
      
      // If no images found with specific selectors, try to get all large images
      if (productInfo.images.length === 0) {
        const allImages = document.querySelectorAll('img')
        allImages.forEach(img => {
          const src = (img as HTMLImageElement).src
          const width = (img as HTMLImageElement).width
          
          // Only include reasonably sized images (likely product images)
          if (src && width > 200 && !src.includes('logo') && !src.includes('icon')) {
            productInfo.images.push(src)
          }
        })
      }
      
      return productInfo
    })

    // Take a screenshot of the product page
    const screenshot = await page.screenshot({ fullPage: true })
    
    // Create a unique folder name based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const folderName = `product-${timestamp}`
    const folderPath = path.join(process.cwd(), 'public', 'downloads', folderName)
    
    // Create the folder structure
    await mkdir(folderPath, { recursive: true })
    
    // Save the screenshot
    await writeFile(path.join(folderPath, 'screenshot.png'), screenshot)
    
    // Save the HTML of the page
    const html = await page.content()
    await writeFile(path.join(folderPath, 'page.html'), html)
    
    // Download product images
    if (productData.images && productData.images.length > 0) {
      const imagePromises = productData.images.map(async (imageUrl: string, index: number) => {
        try {
          const imageResponse = await fetch(imageUrl)
          const arrayBuffer = await imageResponse.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          const imageExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
          const imagePath = path.join(folderPath, `image-${index}.${imageExt}`)
          
          await writeFile(imagePath, buffer)
          
          return `/downloads/${folderName}/image-${index}.${imageExt}`
        } catch (error) {
          console.error(`Failed to download image ${imageUrl}:`, error)
          return null
        }
      })
      
      const downloadedImages = await Promise.all(imagePromises)
      productData.downloadedImages = downloadedImages.filter(Boolean)
    }
    
    // Save the product data as JSON
    await writeFile(
      path.join(folderPath, 'product-data.json'), 
      JSON.stringify(productData, null, 2)
    )
    
    // Close the browser
    await browser.close()
    
    // Return the product data and download links
    return res.status(200).json({
      success: true,
      data: {
        ...productData,
        downloads: {
          screenshot: `/downloads/${folderName}/screenshot.png`,
          html: `/downloads/${folderName}/page.html`,
          json: `/downloads/${folderName}/product-data.json`,
        }
      }
    })
  } catch (error: any) {
    console.error('Error scraping product:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while scraping the product'
    })
  }
}
