import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import i18n from './index';

function TranslatedTitle() {
  const { t } = useTranslation();
  return <h1>{t('app.title')}</h1>;
}

describe('i18n', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders app title in English', async () => {
    await i18n.changeLanguage('en');
    render(<TranslatedTitle />);
    expect(screen.getByText('Escape from Detention Block AA-23')).toBeInTheDocument();
  });

  it('renders app title in Spanish', async () => {
    await i18n.changeLanguage('es');
    render(<TranslatedTitle />);
    expect(screen.getByText('Escapar del Bloque de Detención AA-23')).toBeInTheDocument();
  });
});
