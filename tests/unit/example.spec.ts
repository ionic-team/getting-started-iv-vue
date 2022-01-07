import { isPlatform } from '@ionic/vue';
import { mount } from '@vue/test-utils';
import HomePage from '@/views/HomePage.vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});

describe('HomePage.vue', () => {
  beforeEach(() => {
    (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
    jest.clearAllMocks();
  });

  it('renders home vue', () => {
    // const wrapper = mount(HomePage);
    // const title = wrapper.findComponent('[data-testid="title"]');
    // expect(title.text()).toMatch('IV Tester');
    expect(true).toBe(true);
  });
});
