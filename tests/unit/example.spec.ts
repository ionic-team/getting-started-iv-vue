import { isPlatform } from '@ionic/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn() };
});

describe('HomePage.vue', () => {
  beforeEach(() => {
    (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
    vi.clearAllMocks();
  });

  it('runs a test', () => {
    expect(true).toBe(true);
  });
});
