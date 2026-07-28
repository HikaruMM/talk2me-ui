import { FlashcardFolder, FlashcardSet } from '../types';

export const INITIAL_FLASHCARD_FOLDERS: FlashcardFolder[] = [
  {
    id: 'folder-1',
    name: 'Tiếng Anh IELTS & Giao Tiếp',
    description: 'Từ vựng IELTS Band 7.0+, Academic Word List và mẫu câu giao tiếp tự nhiên.',
    color: '#2E68FF',
    icon: 'folder-code',
    createdAt: '2026-03-20',
    setIds: ['set-1', 'set-3']
  },
  {
    id: 'folder-2',
    name: 'Lập Trình & Công Nghệ Frontend',
    description: 'Kiến thức cốt lõi về HTML5, CSS Grid, Flexbox, React Hooks và UI/UX.',
    color: '#12B76A',
    icon: 'folder-git',
    createdAt: '2026-03-22',
    setIds: ['set-2']
  }
];

export const INITIAL_FLASHCARD_SETS: FlashcardSet[] = [
  {
    id: 'set-1',
    folderId: 'folder-1',
    title: 'IELTS Band 7.0+ Essential Academic Vocabulary',
    description: 'Bộ từ vựng ăn điểm cho IELTS Speaking Part 1 & 2 với phiên âm, định nghĩa chuẩn.',
    isPublic: true,
    createdAt: '2026-03-20',
    cardsCount: 6,
    cards: [
      {
        id: 'c-101',
        setId: 'set-1',
        frontText: 'Pivotal',
        backText: 'Quan trọng then chốt, có tính chất quyết định.',
        phonetic: '/ˈpɪvətəl/',
        exampleSentence: 'Good education plays a pivotal role in shaping a child’s future.',
        status: 'learning'
      },
      {
        id: 'c-102',
        setId: 'set-1',
        frontText: 'Ubiquitous',
        backText: 'Có mặt ở khắp mọi nơi, phổ biến rộng rãi.',
        phonetic: '/juːˈbɪkwɪtəs/',
        exampleSentence: 'Smartphones have become ubiquitous in modern society.',
        status: 'mastered'
      },
      {
        id: 'c-103',
        setId: 'set-1',
        frontText: 'Profound impact',
        backText: 'Tác động sâu sắc, ảnh hưởng lớn lao.',
        phonetic: '/prəˈfaʊnd ˈɪmpækt/',
        exampleSentence: 'Technology has a profound impact on how we communicate.',
        status: 'new'
      },
      {
        id: 'c-104',
        setId: 'set-1',
        frontText: 'Meticulous',
        backText: 'Tỉ mỉ, cẩn thận, trau chuốt từng chi tiết.',
        phonetic: '/məˈtɪkjələs/',
        exampleSentence: 'She was meticulous about keeping her study notes organized.',
        status: 'learning'
      },
      {
        id: 'c-105',
        setId: 'set-1',
        frontText: 'Elucidate',
        backText: 'Làm sáng tỏ, giải thích rõ ràng.',
        phonetic: '/ɪˈluːsɪdeɪt/',
        exampleSentence: 'The teacher used diagrams to elucidate complex physics concepts.',
        status: 'new'
      },
      {
        id: 'c-106',
        setId: 'set-1',
        frontText: 'Resilient',
        backText: 'Kiên cường, nhanh chóng phục hồi sau khó khăn.',
        phonetic: '/rɪˈzɪliənt/',
        exampleSentence: 'Successful learners are resilient when facing difficult exams.',
        status: 'mastered'
      }
    ]
  },
  {
    id: 'set-2',
    folderId: 'folder-2',
    title: 'Modern HTML5 & Web Layout Architecture',
    description: 'Các thuật ngữ và khái niệm lập trình web cần ghi nhớ nhanh.',
    isPublic: true,
    createdAt: '2026-03-22',
    cardsCount: 5,
    cards: [
      {
        id: 'c-201',
        setId: 'set-2',
        frontText: 'Semantic HTML',
        backText: 'Thẻ HTML mang ngữ nghĩa rõ ràng cho cả trình duyệt và người dùng (VD: <main>, <article>, <header>).',
        phonetic: '/sɪˈmæntɪk ˌeɪʧ-tiː-ɛm-ˈɛl/',
        exampleSentence: 'Semantic HTML improves SEO and accessibility.',
        status: 'learning'
      },
      {
        id: 'c-202',
        setId: 'set-2',
        frontText: 'Flexbox vs CSS Grid',
        backText: 'Flexbox là bố cục 1 chiều (hàng HOẶC cột). Grid là bố cục 2 chiều (hàng VÀ cột cùng lúc).',
        phonetic: '/ˈflɛksˌbɑks vɜrsəs ˈsiː-ɛs-ɛs grɪd/',
        exampleSentence: 'Grid handles page structures while flexbox aligns inner controls.',
        status: 'mastered'
      },
      {
        id: 'c-203',
        setId: 'set-2',
        frontText: 'Accessibility (a11y)',
        backText: 'Khả năng truy cập web giúp mọi người dùng bao gồm người khuyết tật dùng được website.',
        phonetic: '/əkˌsɛsəˈbɪlɪti/',
        exampleSentence: 'Always include ARIA attributes for custom widgets.',
        status: 'new'
      },
      {
        id: 'c-204',
        setId: 'set-2',
        frontText: 'Asynchronous JavaScript',
        backText: 'Xử lý bất đồng bộ giúp trang web thực thi công việc mà không làm đóng băng giao diện UI.',
        phonetic: '/eɪˈsɪŋkrənəs ˈʤɑːvəskrɪpt/',
        exampleSentence: 'Promises and async/await handle asynchronous requests cleanly.',
        status: 'learning'
      },
      {
        id: 'c-205',
        setId: 'set-2',
        frontText: 'Responsive Design',
        backText: 'Thiết kế phản hồi tự động co giãn tối ưu trên mọi màn hình di động, máy tính bảng và desktop.',
        phonetic: '/rɪˈspɑnsɪv dɪˈzaɪn/',
        exampleSentence: 'Tailwind media queries make responsive layout implementation seamless.',
        status: 'mastered'
      }
    ]
  },
  {
    id: 'set-3',
    folderId: 'folder-1',
    title: 'Digital Marketing & Business Vocabulary',
    description: 'Từ vựng chuyên ngành Marketing, SEO và phân tích phễu khách hàng.',
    isPublic: false,
    createdAt: '2026-03-24',
    cardsCount: 4,
    cards: [
      {
        id: 'c-301',
        setId: 'set-3',
        frontText: 'Marketing Funnel',
        backText: 'Hành trình khách hàng qua các giai đoạn: Nhận biết (TOFU) -> Cân nhắc (MOFU) -> Quyết định (BOFU).',
        phonetic: '/ˈmɑrkətɪŋ ˈfʌnəl/',
        exampleSentence: 'Top of funnel content builds brand awareness.',
        status: 'learning'
      },
      {
        id: 'c-302',
        setId: 'set-3',
        frontText: 'Conversion Rate (CR)',
        backText: 'Tỷ lệ chuyển đổi % từ người truy cập thành người thực hiện hành động mua hàng/đăng ký.',
        phonetic: '/kənˈvɜrʒən reɪt/',
        exampleSentence: 'Optimizing landing page copy increased our conversion rate by 15%.',
        status: 'mastered'
      },
      {
        id: 'c-303',
        setId: 'set-3',
        frontText: 'Customer Acquisition Cost (CAC)',
        backText: 'Chi phí thu hút một khách hàng mới.',
        phonetic: '/ˈkʌstəmər ˌækwəˈzɪʃən kɑst/',
        exampleSentence: 'Our goal is to reduce CAC while increasing customer lifetime value.',
        status: 'new'
      },
      {
        id: 'c-304',
        setId: 'set-3',
        frontText: 'Search Intent',
        backText: 'Mục đích tìm kiếm thật sự của người dùng khi gõ từ khóa lên Google.',
        phonetic: '/sɜrʧ ɪnˈtɛnt/',
        exampleSentence: 'Matching search intent is the key to ranking #1 on Google.',
        status: 'mastered'
      }
    ]
  }
];
