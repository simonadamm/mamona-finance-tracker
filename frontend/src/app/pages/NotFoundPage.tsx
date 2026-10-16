import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section>
      <h1>Nie znaleziono strony</h1>
      <p>Podany adres nie istnieje.</p>
      <Link to="/transactions">Przejdź do transakcji</Link>
    </section>
  )
}