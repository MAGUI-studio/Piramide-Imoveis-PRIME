import Link from 'next/link'
import {Header} from '../components/chrome'
import {goldButton, heading, wrap} from '../lib/classes'

export default function NotFound() {
  return <><Header /><main id="conteudo" className={wrap + ' pt-24 pb-10'}><h1 className={heading + ' mb-6 text-[clamp(3rem,7vw,8rem)]'}>Imóvel indisponível</h1><Link className={goldButton} href="/#empreendimentos">Explorar imóveis</Link></main></>
}
