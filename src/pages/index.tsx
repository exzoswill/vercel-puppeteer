import Head from 'next/head'
import { useState } from 'react'
import styles from '@/styles/Home.module.css'
import Image from 'next/image'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productData, setProductData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      setError('Por favor, insira uma URL de produto')
      return
    }

    try {
      setLoading(true)
      setError('')
      setProductData(null)

      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar dados do produto')
      }

      setProductData(result.data)
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Scraper de Produtos</title>
        <meta name="description" content="Baixe informações de produtos e imagens" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Scraper de Produtos
        </h1>
        
        <p className={styles.description}>
          Insira a URL de um produto para baixar suas informações, especificações e imagens
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.exemplo.com/produto"
            className={styles.input}
            required
          />
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Baixar Produto'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <p>Buscando dados do produto...</p>
            <p>Isso pode levar alguns segundos.</p>
          </div>
        )}

        {productData && (
          <div className={styles.results}>
            <h2>Dados do Produto</h2>
            
            <div className={styles.productInfo}>
              <h3>{productData.title}</h3>
              {productData.price && <p className={styles.price}>Preço: {productData.price}</p>}
              
              {productData.description && (
                <div className={styles.description}>
                  <h4>Descrição:</h4>
                  <p>{productData.description}</p>
                </div>
              )}
              
              {productData.specifications && Object.keys(productData.specifications).length > 0 && (
                <div className={styles.specifications}>
                  <h4>Especificações:</h4>
                  <table>
                    <tbody>
                      {Object.entries(productData.specifications).map(([key, value]: [string, any]) => (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {productData.downloadedImages && productData.downloadedImages.length > 0 && (
                <div className={styles.images}>
                  <h4>Imagens:</h4>
                  <div className={styles.imageGrid}>
                    {productData.downloadedImages.map((src: string, index: number) => (
                      <div key={index} className={styles.imageWrapper}>
                        <a href={src} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={src} 
                            alt={`Produto ${index + 1}`} 
                            className={styles.productImage}
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {productData.downloads && (
                <div className={styles.downloads}>
                  <h4>Downloads:</h4>
                  <ul>
                    <li>
                      <a href={productData.downloads.screenshot} target="_blank" rel="noopener noreferrer">
                        Screenshot da página
                      </a>
                    </li>
                    <li>
                      <a href={productData.downloads.html} target="_blank" rel="noopener noreferrer">
                        HTML da página
                      </a>
                    </li>
                    <li>
                      <a href={productData.downloads.json} target="_blank" rel="noopener noreferrer">
                        Dados do produto (JSON)
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

