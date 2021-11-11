import { isPlatform } from '@ionic/vue';
import { mount } from '@vue/test-utils';
import Home from '@/views/Home.vue';

jest.mock('@ionic/vue', () => {
  const actual = jest.requireActual('@ionic/vue');
  return { ...actual, isPlatform: jest.fn() };
});

describe('Home.vue', () => {
  beforeEach(() => {
    (isPlatform as any).mockImplementation((key: string) => key === 'hybrid');
    jest.clearAllMocks();
  });

  it('renders home vue', () => {
    const wrapper = mount(Home);
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toMatch('IV Tester');
  });
});
