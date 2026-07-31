import React, { useState } from 'react';
import { 
  Users, 
  Radio, 
  Zap, 
  Mic, 
  MicOff, 
  Flame, 
  Trophy, 
  Gamepad2, 
  Sparkles, 
  Plus, 
  Search, 
  Clock, 
  Bot, 
  CheckCircle2, 
  UserPlus, 
  Volume2, 
  RefreshCw, 
  Check, 
  X, 
  PhoneCall, 
  Video, 
  Maximize2,
  Minimize2,
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Calendar, 
  Activity, 
  CheckSquare, 
  AlertCircle, 
  Globe, 
  ArrowLeft,
  BookOpen,
  FileText,
  ExternalLink,
  FolderPlus,
  Layers,
  GraduationCap
} from 'lucide-react';
import { generateCompletion } from '../../../infrastructure/api/openrouter';
import { INITIAL_COURSES } from '../../../infrastructure/data/mockCourses';

interface SquadResource {
  id: string;
  title: string;
  type: 'video' | 'flashcard' | 'document' | 'link' | 'course';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedByAvatar?: string;
  uploadedByRole?: string;
  uploadedAt: string;
  tags: string[];
  autoTasksGenerated?: boolean;
  courseId?: string;
  flashcardDeckId?: string;
  systemMeta?: {
    lessonsCount?: number;
    thumbnailUrl?: string;
    rating?: number;
    badge?: string;
    cardsCount?: number;
  };
}

interface StudySquad {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  targetGoal: 'IELTS 6.5+' | 'Giao tiếp Pro' | 'TOEIC 800+' | 'English for Tech';
  level: 'Cơ bản (A2)' | 'Trung cấp (B1-B2)' | 'Nâng cao (C1)';
  schedule: string;
  membersCount: number;
  maxMembers: number;
  streakDays: number;
  questProgress: number;
  description: string;
  creator: string;
  interests: string[];
  isOpen: boolean;
}

interface MemberApplicant {
  id: string;
  name: string;
  avatar: string;
  targetGoal: string;
  level: string;
  appliedDate: string;
  note: string;
  streakHistory: number;
}

interface SquadMemberActivity {
  id: string;
  name: string;
  role: 'Người khởi xướng' | 'Thành viên bình đẳng';
  avatar: string;
  status: 'active' | 'pending' | 'absent';
  studyMinutesToday: number;
  tasksCompleted: number;
  totalTasks: number;
  streakDays: number;
  lastActive: string;
}

interface SquadTask {
  id: string;
  title: string;
  category: 'Speaking' | 'Vocabulary' | 'Writing' | 'Call';
  points: number;
  completedMembersCount: number;
  totalMembersCount: number;
  isUserCompleted: boolean;
}

interface LiveStudyRoom {
  id: string;
  title: string;
  squadName: string;
  topic: string;
  hostName: string;
  mode: 'Public' | 'Squad Only';
  type: 'Voice Call' | 'Video Call';
  activeParticipants: number;
  maxParticipants: number;
  hasAiMc: boolean;
}

export interface PublicUserRoom {
  id: string;
  title: string;
  category: 'game' | 'discussion';
  topic: string;
  activityMode: 'topic' | 'word-chain' | 'taboo';
  hostName: string;
  hostAvatar: string;
  hostRole: string;
  activeParticipants: number;
  maxParticipants: number;
  level: string;
  type: 'Voice Call' | 'Video Call';
  requestStatus: 'idle' | 'pending' | 'approved' | 'rejected';
}

interface CommunitySectionProps {
  onSelectCourse?: (courseId: string) => void;
  onOpenFlashcards?: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onSelectCourse, onOpenFlashcards }) => {
  const [activeTab, setActiveTab] = useState<'plaza' | 'public-rooms' | 'squads' | 'manage' | 'live-room' | 'leaderboard'>('plaza');

  const [manageSubTab, setManageSubTab] = useState<'overview' | 'resources' | 'approvals' | 'tasks' | 'activity'>('overview');

  const [squadResources, setSquadResources] = useState<SquadResource[]>([
    {
      id: 'res-course-1',
      title: '🎓 Khóa Học Hệ Thống: Become a Certified Web Developer (HTML, CSS, JS)',
      type: 'course',
      url: '#course-c1',
      courseId: 'c1',
      description: 'Khóa học full-stack frontend trên hệ thống với 3 bài học tương tác, lý thuyết, quiz, dictation và AI writing.',
      uploadedBy: 'Minh Trí',
      uploadedByAvatar: 'MT',
      uploadedByRole: 'Thành viên bình đẳng',
      uploadedAt: 'Hôm nay',
      tags: ['Khóa Học Hệ Thống', 'Web Dev', 'Lý Thuyết & Quiz'],
      autoTasksGenerated: true,
      systemMeta: {
        lessonsCount: 3,
        thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        badge: 'Khóa Học Hệ Thống'
      }
    },
    {
      id: 'res-flashcard-1',
      title: '🎴 Flashcard Hệ Thống: Set 100 Từ Vựng Chuyên Ngành Web Dev & Tech',
      type: 'flashcard',
      url: '#flashcards-tech',
      flashcardDeckId: 'f1',
      description: 'Bộ thẻ từ vựng lặp lại ngắt quãng (SRS) trực tiếp trên hệ thống giúp ghi nhớ từ vựng lâu dài.',
      uploadedBy: 'Kỳ Duyên',
      uploadedByAvatar: 'KD',
      uploadedByRole: 'Khởi xướng nhóm',
      uploadedAt: 'Hôm nay',
      tags: ['Flashcard Hệ Thống', 'SRS', 'Vocabulary'],
      autoTasksGenerated: true,
      systemMeta: {
        cardsCount: 15,
        badge: 'Spaced Repetition'
      }
    },
    {
      id: 'res-1',
      title: '🎥 IELTS Speaking Part 2 - 10 Mẫu Cấu Trúc Trả Lời Tự Nhiên & Đắt Giá',
      type: 'video',
      url: 'https://youtube.com/watch?v=sample123',
      description: 'Video hướng dẫn cách triển khai ý tưởng Part 2 theo khung Time-Place-Feeling mà không bị ngập ngừng.',
      uploadedBy: 'Minh Trí',
      uploadedByAvatar: 'MT',
      uploadedByRole: 'Thành viên bình đẳng',
      uploadedAt: 'Hôm qua',
      tags: ['IELTS Speaking', 'Part 2', 'Video'],
      autoTasksGenerated: true
    },
    {
      id: 'res-3',
      title: '📄 Document: Ebook 20 Bài Mẫu Writing Task 2 Đạt Band 7.5+',
      type: 'document',
      url: 'https://drive.google.com/sample-writing-pdf',
      description: 'Tài liệu PDF tổng hợp các bài mẫu Writing có chú giải cấu trúc câu & phrasal verbs đắt giá.',
      uploadedBy: 'Bảo Ngọc',
      uploadedByAvatar: 'BN',
      uploadedByRole: 'Thành viên bình đẳng',
      uploadedAt: '3 ngày trước',
      tags: ['Writing Task 2', 'Ebook PDF', 'Band 7.5+'],
      autoTasksGenerated: false
    }
  ]);

  const [isAddResourceOpen, setIsAddResourceOpen] = useState<boolean>(false);
  const [resourceSourceMode, setResourceSourceMode] = useState<'system' | 'custom'>('system');
  const [selectedSystemItemType, setSelectedSystemItemType] = useState<'course' | 'flashcard'>('course');
  const [selectedSystemCourseId, setSelectedSystemCourseId] = useState<string>(INITIAL_COURSES[0]?.id || 'c1');
  const [newResTitle, setNewResTitle] = useState<string>('');
  const [newResType, setNewResType] = useState<'video' | 'flashcard' | 'document' | 'link' | 'course'>('course');
  const [newResUrl, setNewResUrl] = useState<string>('');
  const [newResDesc, setNewResDesc] = useState<string>('');
  const [newResTags, setNewResTags] = useState<string>('Khóa học chung, IELTS');

  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState<boolean>(false);
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [matchedPartner, setMatchedPartner] = useState<{
    name: string;
    avatar: string;
    level: string;
    topic: string;
  } | null>(null);

  const [isLiveCallActive, setIsLiveCallActive] = useState<boolean>(false);
  const [activeRoomTitle, setActiveRoomTitle] = useState<string>('Phòng Speaking IELTS Task 2 - Topic Environment');
  const [activeGame, setActiveGame] = useState<'topic' | 'word-chain' | 'taboo'>('topic');
  const [selectedRoomActivity, setSelectedRoomActivity] = useState<'topic' | 'word-chain' | 'taboo'>('topic');
  const [gameScore, setGameScore] = useState<number>(0);
  const [aiTopicCards, setAiTopicCards] = useState<string[]>([
    "Chủ đề hôm nay: Describe your favorite travel memory using at least 3 adjectives.",
    "Từ vựng nên dùng: Breathtaking, Unforgettable, Local delicacy, Picturesque",
    "Gợi ý mở đầu: 'One of the most memorable trips I've ever taken was when...'"
  ]);
  const [isGeneratingAiTopic, setIsGeneratingAiTopic] = useState<boolean>(false);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [camOn, setCamOn] = useState<boolean>(true);
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [isCallMaximized, setIsCallMaximized] = useState<boolean>(false);
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>('');

  const [wordChainHistory, setWordChainHistory] = useState<string[]>(['EDUCATION', 'NATURE', 'ENVIRONMENT']);
  const [wordChainInput, setWordChainInput] = useState<string>('');
  const [tabooGuessInput, setTabooGuessInput] = useState<string>('');
  const [tabooFeedback, setTabooFeedback] = useState<string>('');
  const [activeTurnPlayer, setActiveTurnPlayer] = useState<string>('Kỳ Duyên (Bạn)');
  const [customLobbyTopic, setCustomLobbyTopic] = useState<string>('Topic Environment & Climate Change (IELTS Task 2)');

  const [isCreateSquadOpen, setIsCreateSquadOpen] = useState<boolean>(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);

  const [publicRoomsCategory, setPublicRoomsCategory] = useState<'all' | 'game' | 'discussion'>('game');

  const [publicRooms, setPublicRooms] = useState<PublicUserRoom[]>([
    {
      id: 'pub-room-1',
      title: '🎮 Sảnh Game Đêm: Taboo & Nối Từ Band 6.5+',
      category: 'game',
      topic: 'Game Đoán Từ Taboo & Nối Chữ Từ Vựng Du Lịch & Cuộc Sống',
      activityMode: 'taboo',
      hostName: 'Trần Minh Thu',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      hostRole: 'Chủ phòng (IELTS 7.5)',
      activeParticipants: 4,
      maxParticipants: 6,
      level: 'B1-B2 (Trung cấp)',
      type: 'Voice Call',
      requestStatus: 'idle'
    },
    {
      id: 'pub-room-2',
      title: '🔤 Thử Thách Nối Từ Tiếng Anh - Chuyên Ngành Tech & AI',
      category: 'game',
      topic: 'Nối từ tiếng Anh IT, phần mềm & Thưởng điểm thi đua chuỗi nhóm',
      activityMode: 'word-chain',
      hostName: 'Lê Quốc Bảo',
      hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      hostRole: 'Chủ phòng (Tech Leader)',
      activeParticipants: 3,
      maxParticipants: 5,
      level: 'C1 (Nâng cao)',
      type: 'Voice Call',
      requestStatus: 'idle'
    },
    {
      id: 'pub-room-3',
      title: '🎲 Taboo Challenge: Đoán Từ Bí Mật KhÔNG Dùng Từ Cấm',
      category: 'game',
      topic: 'Luyện phản xạ diễn đạt từ vựng IELTS C1-C2 không bị bí ý',
      activityMode: 'taboo',
      hostName: 'Phạm Hoàng Anh',
      hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      hostRole: 'Chủ phòng (Band 8.0)',
      activeParticipants: 2,
      maxParticipants: 4,
      level: 'A2-B1 (Cơ bản)',
      type: 'Voice Call',
      requestStatus: 'idle'
    },
    {
      id: 'pub-room-4',
      title: '🗣️ Topic Tranh Luận: "AI in Education - Pros & Cons"',
      category: 'discussion',
      topic: 'Luyện tư duy phản biện & Sử dụng từ vựng nâng cao C1 theo câu hỏi AI MC',
      activityMode: 'topic',
      hostName: 'Nguyễn Văn Nam',
      hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      hostRole: 'Chủ phòng (IELTS 7.5)',
      activeParticipants: 4,
      maxParticipants: 5,
      level: 'B2-C1 (Khá - Giỏi)',
      type: 'Voice Call',
      requestStatus: 'idle'
    },
    {
      id: 'pub-room-5',
      title: '💬 Speaking IELTS Task 2 - Environment & Climate Action',
      category: 'discussion',
      topic: 'Thảo luận giải pháp biến đổi khí hậu & nhận gợi ý sửa lỗi AI MC',
      activityMode: 'topic',
      hostName: 'Vũ Thị Mai',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      hostRole: 'Chủ phòng (IELTS Trainer)',
      activeParticipants: 3,
      maxParticipants: 4,
      level: 'B1-B2 (Trung cấp)',
      type: 'Video Call',
      requestStatus: 'idle'
    },
    {
      id: 'pub-room-6',
      title: '☕ English Coffee Chat - Career Goals & Work-Life Balance',
      category: 'discussion',
      topic: 'Trò chuyện tự do, chia sẻ mục tiêu sự nghiệp & thói quen học tập',
      activityMode: 'topic',
      hostName: 'Trịnh Bảo Ngọc',
      hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      hostRole: 'Chủ phòng (Giao Tiếp Pro)',
      activeParticipants: 2,
      maxParticipants: 5,
      level: 'A2-B1 (Cơ bản)',
      type: 'Voice Call',
      requestStatus: 'idle'
    }
  ]);

  const handleRequestJoinPublicRoom = (roomId: string) => {
    setPublicRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, requestStatus: 'pending' };
      }
      return room;
    }));

    setTimeout(() => {
      setPublicRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return { ...room, requestStatus: 'approved' };
        }
        return room;
      }));
    }, 2500);
  };

  const handleEnterApprovedPublicRoom = (room: PublicUserRoom) => {
    setActiveRoomTitle(room.title);
    setCustomLobbyTopic(room.topic);
    setActiveGame(room.activityMode);
    setActiveTab('live-room');
    setIsLiveCallActive(false);
  };

  const [newSquadName, setNewSquadName] = useState<string>('');
  const [newSquadGoal, setNewSquadGoal] = useState<any>('IELTS 6.5+');
  const [newSquadSchedule, setNewSquadSchedule] = useState<string>('20:30 - 21:30 Mỗi tối');

  const [newRoomTitle, setNewRoomTitle] = useState<string>('');
  const [newRoomTopic, setNewRoomTopic] = useState<string>('Chủ đề tự do / IELTS Speaking');
  const [newRoomMode, setNewRoomMode] = useState<'Public' | 'Squad Only'>('Squad Only');
  const [newRoomType, setNewRoomType] = useState<'Voice Call' | 'Video Call'>('Voice Call');

  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Speaking' | 'Vocabulary' | 'Writing' | 'Call'>('Speaking');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(50);

  const [squads, setSquads] = useState<StudySquad[]>([
    {
      id: 'squad-1',
      name: 'IELTS Band 7.5 Warriors 🚀',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      badge: 'Top 1 Weekly',
      targetGoal: 'IELTS 6.5+',
      level: 'Trung cấp (B1-B2)',
      schedule: '21:00 - 22:00 Mỗi tối',
      membersCount: 4,
      maxMembers: 5,
      streakDays: 18,
      questProgress: 85,
      description: 'Nhóm cùng luyện Speaking & Writing task 2 hàng ngày. Kỷ luật cao, điểm danh mỗi ngày!',
      creator: 'Kỳ Duyên',
      interests: ['IELTS', 'Phim ảnh', 'Du lịch'],
      isOpen: true
    },
    {
      id: 'squad-2',
      name: 'Tech & AI Talkers 🤖',
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150',
      badge: 'Siêu Tích Cực',
      targetGoal: 'English for Tech',
      level: 'Nâng cao (C1)',
      schedule: '20:00 - 21:00 Thứ 2,4,6',
      membersCount: 5,
      maxMembers: 6,
      streakDays: 24,
      questProgress: 100,
      description: 'Chuyên thảo luận tin tức công nghệ, phỏng vấn IT bằng Tiếng Anh và thuyết trình dự án.',
      creator: 'Minh Trí',
      interests: ['Công nghệ', 'Startup', 'Lập trình'],
      isOpen: true
    },
    {
      id: 'squad-3',
      name: 'Giao Tiếp Tự Tin 100% ☕',
      avatar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150',
      badge: 'Thân Thiện',
      targetGoal: 'Giao tiếp Pro',
      level: 'Cơ bản (A2)',
      schedule: '19:30 - 20:30 Hàng ngày',
      membersCount: 3,
      maxMembers: 4,
      streakDays: 12,
      questProgress: 60,
      description: 'Luyện nói từ cơ bản, không sợ sai ngữ pháp! Môi trường vui vẻ, hòa đồng và động viên nhau.',
      creator: 'Bảo Ngọc',
      interests: ['Âm nhạc', 'Ẩm thực', 'Cuộc sống'],
      isOpen: true
    },
    {
      id: 'squad-4',
      name: 'TOEIC 850+ Chinh Phục 🎯',
      avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150',
      badge: 'Kỷ Luật Cao',
      targetGoal: 'TOEIC 800+',
      level: 'Trung cấp (B1-B2)',
      schedule: '21:30 - 22:30 Thứ 3,5,7',
      membersCount: 3,
      maxMembers: 5,
      streakDays: 9,
      questProgress: 45,
      description: 'Chuyên giải đề Part 5, 6, 7 & luyện nghe Part 3, 4 theo phương pháp shadow reading.',
      creator: 'Hoàng Nam',
      interests: ['TOEIC', 'Kinh doanh', 'Đọc sách'],
      isOpen: true
    }
  ]);

  const [pendingApplicants, setPendingApplicants] = useState<MemberApplicant[]>([
    {
      id: 'app-1',
      name: 'Nguyễn Văn Hải',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      targetGoal: 'IELTS 6.5+',
      level: 'B1 (Intermediate)',
      appliedDate: '10 phút trước',
      note: 'Chào nhóm, mình đang muốn luyện IELTS Speaking part 2 & 3. Cam kết học đều khung giờ 21h hàng tối!',
      streakHistory: 14
    },
    {
      id: 'app-2',
      name: 'Trần Thu Phương',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      targetGoal: 'IELTS 7.0+',
      level: 'B2 (Upper-Intermediate)',
      appliedDate: '1 giờ trước',
      note: 'Mình cần môi trường giao tiếp phản xạ tự nhiên. Rất mong được gia nhập nhóm cùng luyện tập!',
      streakHistory: 21
    }
  ]);

  const [memberActivities, setMemberActivities] = useState<SquadMemberActivity[]>([
    {
      id: 'mem-1',
      name: 'Kỳ Duyên (Bạn)',
      role: 'Người khởi xướng',
      avatar: 'KD',
      status: 'active',
      studyMinutesToday: 45,
      tasksCompleted: 3,
      totalTasks: 3,
      streakDays: 18,
      lastActive: 'Đang online'
    },
    {
      id: 'mem-2',
      name: 'Minh Trí',
      role: 'Thành viên bình đẳng',
      avatar: 'MT',
      status: 'active',
      studyMinutesToday: 30,
      tasksCompleted: 3,
      totalTasks: 3,
      streakDays: 18,
      lastActive: '5 phút trước'
    },
    {
      id: 'mem-3',
      name: 'Bảo Ngọc',
      role: 'Thành viên bình đẳng',
      avatar: 'BN',
      status: 'active',
      studyMinutesToday: 20,
      tasksCompleted: 2,
      totalTasks: 3,
      streakDays: 18,
      lastActive: '25 phút trước'
    },
    {
      id: 'mem-4',
      name: 'Hoàng Nam',
      role: 'Thành viên bình đẳng',
      avatar: 'HN',
      status: 'pending',
      studyMinutesToday: 0,
      tasksCompleted: 0,
      totalTasks: 3,
      streakDays: 17,
      lastActive: 'Hôm qua'
    }
  ]);

  const [squadTasks, setSquadTasks] = useState<SquadTask[]>([
    {
      id: 'task-1',
      title: '🎙️ Luyện nói 15 phút trong Phòng Call Nhóm',
      category: 'Speaking',
      points: 50,
      completedMembersCount: 3,
      totalMembersCount: 4,
      isUserCompleted: true
    },
    {
      id: 'task-2',
      title: '📖 Học 10 từ vựng đắt giá từ AI Topic Card',
      category: 'Vocabulary',
      points: 30,
      completedMembersCount: 3,
      totalMembersCount: 4,
      isUserCompleted: true
    },
    {
      id: 'task-3',
      title: '✍️ Viết 1 bài mở bài IELTS Writing Task 2',
      category: 'Writing',
      points: 40,
      completedMembersCount: 2,
      totalMembersCount: 4,
      isUserCompleted: true
    }
  ]);

  const [liveRooms, setLiveRooms] = useState<LiveStudyRoom[]>([
    {
      id: 'room-1',
      title: 'Phòng Speaking IELTS Task 2 - Topic Environment',
      squadName: 'IELTS Band 7.5 Warriors 🚀',
      topic: 'Chủ đề Môi Trường & Biến Đổi Khí Hậu',
      hostName: 'Kỳ Duyên',
      mode: 'Squad Only',
      type: 'Voice Call',
      activeParticipants: 4,
      maxParticipants: 5,
      hasAiMc: true
    },
    {
      id: 'room-2',
      title: '🎮 Sảnh Game Đêm: Taboo & Nối Từ Tiếng Anh',
      squadName: 'Cộng đồng chung',
      topic: 'Game Nhìn Hình Đoán Chữ & Từ Vựng Du Lịch',
      hostName: 'Talk2Me AI Bot',
      mode: 'Public',
      type: 'Voice Call',
      activeParticipants: 12,
      maxParticipants: 20,
      hasAiMc: true
    }
  ]);

  const handleApproveMember = (applicant: MemberApplicant) => {
    setPendingApplicants(prev => prev.filter(a => a.id !== applicant.id));
    const newMember: SquadMemberActivity = {
      id: `mem-${Date.now()}`,
      name: applicant.name,
      role: 'Thành viên bình đẳng',
      avatar: applicant.name.slice(0, 2).toUpperCase(),
      status: 'pending',
      studyMinutesToday: 0,
      tasksCompleted: 0,
      totalTasks: 3,
      streakDays: applicant.streakHistory,
      lastActive: 'Vừa gia nhập'
    };
    setMemberActivities(prev => [...prev, newMember]);
    alert(`🎉 Đã phê duyệt thành viên ${applicant.name} vào nhóm thành công!`);
  };

  const handleDeclineMember = (applicantId: string) => {
    setPendingApplicants(prev => prev.filter(a => a.id !== applicantId));
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();

    if (resourceSourceMode === 'system') {
      if (selectedSystemItemType === 'course') {
        const course = INITIAL_COURSES.find(c => c.id === selectedSystemCourseId) || INITIAL_COURSES[0];
        const newResource: SquadResource = {
          id: `res-course-${Date.now()}`,
          title: `🎓 Khóa Học Hệ Thống: ${course.title}`,
          type: 'course',
          url: `#course-${course.id}`,
          courseId: course.id,
          description: course.description,
          uploadedBy: 'Kỳ Duyên (Bạn)',
          uploadedByAvatar: 'KD',
          uploadedByRole: 'Thành viên nhóm',
          uploadedAt: 'Vừa xong',
          tags: ['Khóa Học Hệ Thống', course.category, course.difficulty],
          autoTasksGenerated: false,
          systemMeta: {
            lessonsCount: course.lessons.length,
            thumbnailUrl: course.thumbnailUrl,
            rating: course.rating,
            badge: course.category
          }
        };
        setSquadResources(prev => [newResource, ...prev]);
        setIsAddResourceOpen(false);
        handleGenerateTasksFromResource(newResource);
        return;
      } else {
        const newResource: SquadResource = {
          id: `res-flash-${Date.now()}`,
          title: '🎴 Flashcard Hệ Thống: Set 100 Từ Vựng Lặp Lại Ngắt Quãng (SRS)',
          type: 'flashcard',
          url: '#flashcards-system',
          flashcardDeckId: 'f1',
          description: 'Bộ thẻ từ vựng lặp lại ngắt quãng (SRS) trực tiếp trên hệ thống giúp học từ vựng nhanh & nhớ lâu.',
          uploadedBy: 'Kỳ Duyên (Bạn)',
          uploadedByAvatar: 'KD',
          uploadedByRole: 'Thành viên nhóm',
          uploadedAt: 'Vừa xong',
          tags: ['Flashcard Hệ Thống', 'SRS', 'Vocabulary'],
          autoTasksGenerated: false,
          systemMeta: {
            cardsCount: 15,
            badge: 'Spaced Repetition'
          }
        };
        setSquadResources(prev => [newResource, ...prev]);
        setIsAddResourceOpen(false);
        handleGenerateTasksFromResource(newResource);
        return;
      }
    }

    if (!newResTitle.trim()) return;

    const newResource: SquadResource = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      type: newResType,
      url: newResUrl.trim() || '#',
      description: newResDesc.trim() || 'Tài liệu học tập chia sẻ chung cho tất cả các thành viên trong nhóm.',
      uploadedBy: 'Kỳ Duyên (Bạn)',
      uploadedByAvatar: 'KD',
      uploadedByRole: 'Thành viên nhóm',
      uploadedAt: 'Vừa xong',
      tags: newResTags.split(',').map(t => t.trim()).filter(Boolean),
      autoTasksGenerated: false
    };

    setSquadResources(prev => [newResource, ...prev]);
    setIsAddResourceOpen(false);
    setNewResTitle('');
    setNewResUrl('');
    setNewResDesc('');

    handleGenerateTasksFromResource(newResource);
  };

  const handleGenerateTasksFromResource = (res: SquadResource) => {
    const task1Title = `📖 Ôn tập tài liệu: "${res.title.slice(0, 40)}..."`;
    const task2Title = res.type === 'video'
      ? `🎙️ Thảo luận 3 điểm quan trọng từ Video chia sẻ bởi ${res.uploadedBy}`
      : res.type === 'flashcard'
      ? `⚡ Học xong bộ Flashcards từ kho tài liệu của ${res.uploadedBy}`
      : `✍️ Thực hành áp dụng 3 từ vựng/cấu trúc từ "${res.title.slice(0, 30)}"`;

    const generatedTasks: SquadTask[] = [
      {
        id: `task-gen-1-${Date.now()}`,
        title: task1Title,
        category: res.type === 'video' ? 'Speaking' : res.type === 'flashcard' ? 'Vocabulary' : 'Writing',
        points: 40,
        completedMembersCount: 0,
        totalMembersCount: memberActivities.length,
        isUserCompleted: false
      },
      {
        id: `task-gen-2-${Date.now()}`,
        title: task2Title,
        category: 'Vocabulary',
        points: 50,
        completedMembersCount: 0,
        totalMembersCount: memberActivities.length,
        isUserCompleted: false
      }
    ];

    setSquadTasks(prev => [...prev, ...generatedTasks]);
    setSquadResources(prev => prev.map(r => r.id === res.id ? { ...r, autoTasksGenerated: true } : r));

    alert(`🤖 Hệ thống AI đã quét tài liệu "${res.title}" và tự động tạo 2 Nhiệm vụ ôn tập chung cho tất cả thành viên trong nhóm!`);
  };

  const handleToggleTask = (taskId: string) => {
    setSquadTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.isUserCompleted;
        return {
          ...t,
          isUserCompleted: nextCompleted,
          completedMembersCount: nextCompleted ? t.completedMembersCount + 1 : t.completedMembersCount - 1
        };
      }
      return t;
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: SquadTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      points: newTaskPoints,
      completedMembersCount: 0,
      totalMembersCount: memberActivities.length,
      isUserCompleted: false
    };

    setSquadTasks(prev => [...prev, newTask]);
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
  };

  const handleCreateLiveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const createdTitle = newRoomTitle.trim() || 'Phòng Luyện Nói Nhóm Mới';
    
    const newRoom: LiveStudyRoom = {
      id: `room-${Date.now()}`,
      title: createdTitle,
      squadName: 'IELTS Band 7.5 Warriors 🚀',
      topic: newRoomTopic,
      hostName: 'Kỳ Duyên',
      mode: newRoomMode,
      type: newRoomType,
      activeParticipants: 1,
      maxParticipants: 5,
      hasAiMc: true
    };

    setLiveRooms(prev => [newRoom, ...prev]);
    setIsCreateRoomOpen(false);
    setActiveRoomTitle(createdTitle);
    setCustomLobbyTopic(newRoomTopic);
    setActiveGame(selectedRoomActivity);
    setActiveTab('live-room');
    setIsLiveCallActive(false);
  };

  const handleWordChainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordChainInput.trim()) return;
    const word = wordChainInput.trim().toUpperCase();
    const lastWord = wordChainHistory[wordChainHistory.length - 1];
    const requiredChar = lastWord.charAt(lastWord.length - 1);
    if (word.charAt(0) !== requiredChar) {
      alert(`⚠️ Từ nối phải bắt đầu bằng chữ '${requiredChar}'! Bạn đã nhập '${word.charAt(0)}'.`);
      return;
    }
    setWordChainHistory(prev => [...prev, word]);
    setGameScore(prev => prev + 15);
    setWordChainInput('');
    setActiveTurnPlayer(prev => prev === 'Kỳ Duyên (Bạn)' ? 'Minh Trí' : prev === 'Minh Trí' ? 'Bảo Ngọc' : 'Kỳ Duyên (Bạn)');
  };

  const handleTabooSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabooGuessInput.trim()) return;
    const guess = tabooGuessInput.trim().toLowerCase();
    if (guess.includes('telescope') || guess.includes('kính thiên văn')) {
      setGameScore(prev => prev + 25);
      setTabooFeedback('🎉 Chính xác! Từ bí mật là TELESCOPE (+25 Pts)');
    } else {
      setTabooFeedback(`❌ '${tabooGuessInput}' chưa đúng. Gợi ý: Dụng cụ quan sát các vì sao xa xôi!`);
    }
    setTabooGuessInput('');
  };

  const handleStartQuickMatch = () => {
    setIsMatchingModalOpen(true);
    setMatchingStatus('searching');
    setTimeout(() => {
      setMatchingStatus('matched');
      setMatchedPartner({
        name: 'Alex Rivera (Hà Nội)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level: 'IELTS 6.5 • Trung cấp B2',
        topic: 'Thảo luận về thói quen học tập & sở thích xem phim tiếng Anh'
      });
    }, 2200);
  };

  const handleGenerateNewAiTopic = async () => {
    setIsGeneratingAiTopic(true);
    try {
      const prompt = `Hãy tạo 1 thẻ thảo luận tiếng Anh ngắn gồm: 1 câu hỏi chủ đề giao tiếp hay, 4 từ vựng đắt giá nên dùng, và 1 câu gợi ý mở đầu bằng tiếng Anh kèm giải thích tiếng Việt ngắn gọn. Trả về dạng JSON dạng văn bản sạch.`;
      const res = await generateCompletion(prompt, 'google/gemini-2.0-flash-exp:free');
      setAiTopicCards([
        `💡 AI Topic Mới: ${res.slice(0, 180)}...`,
        "Gợi ý: Hãy phân công từng thành viên nói trong 2 phút!",
        "Mục tiêu nhóm: Sử dụng ít nhất 2 từ vựng mới trong bài nói."
      ]);
    } catch {
      setAiTopicCards([
        "💡 AI Topic: Describe a skill you would like to master in the next 6 months.",
        "Vocabulary: Mastery, Dedication, Steep learning curve, Breakthrough",
        "Starter: 'If I could master one new skill effortlessly, it would definitely be...'"
      ]);
    } finally {
      setIsGeneratingAiTopic(false);
    }
  };

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;

    const created: StudySquad = {
      id: `squad-${Date.now()}`,
      name: newSquadName.trim(),
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      badge: 'Tân Binh',
      targetGoal: newSquadGoal,
      level: 'Trung cấp (B1-B2)',
      schedule: newSquadSchedule,
      membersCount: 1,
      maxMembers: 5,
      streakDays: 1,
      questProgress: 20,
      description: 'Nhóm học tập mới tạo! Chào mừng các bạn có cùng mục tiêu gia nhập.',
      creator: 'Bạn (Kỳ Duyên)',
      interests: ['Học tập', 'Giao tiếp'],
      isOpen: true
    };

    setSquads([created, ...squads]);
    setIsCreateSquadOpen(false);
    setNewSquadName('');
  };

  const filteredSquads = squads.filter(s => {
    const matchesGoal = selectedGoal === 'All' || s.targetGoal === selectedGoal;
    const matchesLevel = selectedLevel === 'All' || s.level === selectedLevel;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGoal && matchesLevel && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        <aside className="lg:col-span-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl lg:rounded-3xl p-3.5 sm:p-5 lg:py-6 lg:px-4 shadow-sm space-y-3 sm:space-y-4 lg:space-y-6 lg:sticky lg:top-4">
          <div className="px-1 space-y-2 pb-3 lg:pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#1B1F2E] dark:text-white tracking-tight flex items-center gap-1.5 min-w-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#2E68FF] shrink-0" />
                <span className="truncate">Cộng Đồng & Squad</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                115 Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug hidden sm:block">
              Kết nối bạn học, ghép nói 1-1 & làm bài tập nhóm.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setIsCreateRoomOpen(true)}
                className="py-2 px-2.5 rounded-xl bg-[#2E68FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span>Tạo phòng</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateSquadOpen(true)}
                className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Tạo nhóm</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="px-2 hidden lg:block">
              <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Danh Mục Tương Tác
              </div>
            </div>

            <nav className="flex lg:flex-col overflow-x-auto scrollbar-none gap-1.5 pb-1 lg:pb-0 -mx-1 px-1">
              <button
                type="button"
                onClick={() => setActiveTab('plaza')}
                className={`shrink-0 lg:w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'plaza'
                    ? 'bg-[#2E68FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-slate-50 dark:bg-slate-900/50 lg:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Globe className={`w-4 h-4 shrink-0 ${activeTab === 'plaza' ? 'text-white' : 'text-[#2E68FF]'}`} />
                  <span className="whitespace-nowrap">Sảnh Chung</span>
                </div>
                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'plaza' ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950 text-[#2E68FF]'
                }`}>Nổi Bật</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('squads')}
                className={`shrink-0 lg:w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'squads'
                    ? 'bg-[#2E68FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-slate-50 dark:bg-slate-900/50 lg:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Search className={`w-4 h-4 shrink-0 ${activeTab === 'squads' ? 'text-white' : 'text-[#2E68FF]'}`} />
                  <span className="whitespace-nowrap">Tìm Nhóm Squad</span>
                </div>
                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'squads' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>{squads.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`shrink-0 lg:w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'manage'
                    ? 'bg-[#2E68FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-slate-50 dark:bg-slate-900/50 lg:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'manage' ? 'text-white' : 'text-emerald-500'}`} />
                  <span className="whitespace-nowrap">Nhóm Của Tôi</span>
                </div>
                {pendingApplicants.length > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse shrink-0">
                    {pendingApplicants.length}
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                    activeTab === 'manage' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                  }`}>Quản lý</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('live-room')}
                className={`shrink-0 lg:w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'live-room'
                    ? 'bg-[#2E68FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-slate-50 dark:bg-slate-900/50 lg:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Radio className={`w-4 h-4 shrink-0 ${activeTab === 'live-room' ? 'text-white' : 'text-red-500 animate-pulse'}`} />
                  <span className="whitespace-nowrap">Phòng Call Live</span>
                </div>
                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'live-room' ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-950 text-red-600'
                }`}>{liveRooms.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className={`shrink-0 lg:w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-[#2E68FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-slate-50 dark:bg-slate-900/50 lg:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Trophy className={`w-4 h-4 shrink-0 ${activeTab === 'leaderboard' ? 'text-white' : 'text-amber-500'}`} />
                  <span className="whitespace-nowrap">Bảng Xếp Hạng</span>
                </div>
                <span className={`text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'leaderboard' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                }`}>Top 10</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 hidden lg:block">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#1B1F2E] dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#2E68FF] fill-[#2E68FF]" /> Ghép Nói 1-1 Nhanh
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Ghép ngẫu nhiên bạn học nói tiếng Anh 10 phút để tăng phản xạ tự nhiên.
              </p>
              <button
                type="button"
                onClick={handleStartQuickMatch}
                className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E68FF] dark:hover:bg-[#2E68FF] text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all border border-slate-200 dark:border-slate-700 group"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-600 dark:fill-slate-300 group-hover:fill-white text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors" />
                <span>Bắt Đầu Ghép Ngay</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 min-w-0">
          {activeTab === 'plaza' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-3 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2E68FF] dark:text-[#5B8CFF]">
                        Quick Voice 1-1
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 shrink-0">
                        <Users className="w-3.5 h-3.5 text-[#2E68FF]" /> 115 Online
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1B1F2E] dark:text-white leading-snug">
                      ⚡ Ghép Đôi Luyện Nói 1-1 Ngẫu Nhiên
                    </h3>
                    <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1] leading-relaxed">
                      Ghép với bạn học rảnh trong 10-15 phút. Có thẻ AI gợi ý câu hỏi để không bao giờ bí từ.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartQuickMatch}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E68FF] dark:hover:bg-[#2E68FF] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 group"
                  >
                    <Zap className="w-4 h-4 fill-slate-700 dark:fill-slate-300 group-hover:fill-white text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors shrink-0" />
                    <span>Tìm Bạn Luyện Nói Ngay</span>
                  </button>
                </div>

                <div 
                  onClick={() => {
                    setPublicRoomsCategory('game');
                    setActiveTab('public-rooms');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-3 flex flex-col justify-between cursor-pointer transition-all shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                        Sự Kiện Đêm
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#2E68FF]" /> 21:30 Tối Nay
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1B1F2E] dark:text-white leading-snug">
                      🎮 Sảnh Game Đêm: Taboo & Nối Từ
                    </h3>
                    <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1] leading-relaxed">
                      Trò chơi tiếng Anh tương tác có thưởng x2 điểm chuỗi nhóm do AI MC làm trọng tài.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPublicRoomsCategory('game');
                      setActiveTab('public-rooms');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E68FF] dark:hover:bg-[#2E68FF] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 group"
                  >
                    <Gamepad2 className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors shrink-0" />
                    <span className="truncate">Phòng Game ({publicRooms.filter(r => r.category === 'game').length})</span>
                  </button>
                </div>

                <div 
                  onClick={() => {
                    setPublicRoomsCategory('discussion');
                    setActiveTab('public-rooms');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-3 flex flex-col justify-between cursor-pointer transition-all shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-ping" /> Live Topic
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">28 Tham gia</span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1B1F2E] dark:text-white leading-snug">
                      🗣️ Topic: "AI in Education"
                    </h3>
                    <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1] leading-relaxed">
                      Luyện tư duy phản biện & từ vựng C1. Xin duyệt vào phòng call ngay.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPublicRoomsCategory('discussion');
                      setActiveTab('public-rooms');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E68FF] dark:hover:bg-[#2E68FF] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 group"
                  >
                    <Mic className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors shrink-0" />
                    <span className="truncate">Phòng Topic & Mic ({publicRooms.filter(r => r.category === 'discussion').length})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'squads' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#2E68FF]" />
                    <span>Danh Sách Nhóm Tuyển Thành Viên</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Lọc nhóm theo mục tiêu, trình độ và lịch học.
                  </p>
                </div>

                <div className="relative sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên nhóm..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#1B1F2E] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                {filteredSquads.map((squad) => (
                  <div
                    key={squad.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-[#2E68FF] transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={squad.avatar}
                            alt={squad.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-[#1B1F2E] dark:text-white truncate">{squad.name}</h4>
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
                                {squad.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">Khởi xướng: <strong>{squad.creator}</strong></p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-amber-500 flex items-center justify-end gap-1">
                            <Flame className="w-3.5 h-3.5 fill-amber-500" /> {squad.streakDays}d
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                            {squad.membersCount}/{squad.maxMembers} người
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {squad.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert(`Đã gửi đơn xin gia nhập nhóm "${squad.name}"!`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E68FF] dark:hover:bg-[#2E68FF] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 group"
                    >
                      <UserPlus className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors shrink-0" />
                      <span>Nộp Đơn Gia Nhập Nhóm</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#E4E8F0] dark:border-[#334155] pb-4 sm:pb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base sm:text-xl shadow-md shrink-0">
                    SQ1
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-extrabold text-[#1B1F2E] dark:text-white truncate">
                      IELTS Band 7.5 Warriors 🚀
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                      Khởi xướng: <strong>Kỳ Duyên</strong> • <strong>4/5 người</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setManageSubTab('overview')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shrink-0 ${
                    manageSubTab === 'overview' ? 'bg-white dark:bg-[#1E293B] text-[#2E68FF] shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Tổng Quan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManageSubTab('resources')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shrink-0 ${
                    manageSubTab === 'resources' ? 'bg-white dark:bg-[#1E293B] text-[#2E68FF] shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kho Tài Liệu ({squadResources.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManageSubTab('approvals')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shrink-0 ${
                    manageSubTab === 'approvals' ? 'bg-white dark:bg-[#1E293B] text-[#2E68FF] shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Phê Duyệt ({pendingApplicants.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManageSubTab('tasks')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shrink-0 ${
                    manageSubTab === 'tasks' ? 'bg-white dark:bg-[#1E293B] text-[#2E68FF] shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Nhiệm Vụ ({squadTasks.length})</span>
                </button>
              </div>

              {manageSubTab === 'resources' && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-extrabold text-sm text-[#1B1F2E] dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#2E68FF]" />
                      <span>Kho Tài Liệu Chia Sẻ Chung ({squadResources.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddResourceOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#2E68FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>Chia Sẻ Tài Liệu Mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {squadResources.map((res) => (
                      <div key={res.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="font-extrabold text-sm text-[#1B1F2E] dark:text-white leading-snug">{res.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{res.description}</p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          {res.type === 'course' ? (
                            <button
                              type="button"
                              onClick={() => onSelectCourse && onSelectCourse(res.courseId || 'c1')}
                              className="px-3 py-1.5 rounded-lg bg-[#2E68FF] text-white font-extrabold text-xs flex items-center gap-1.5"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Mở Khóa Học</span>
                            </button>
                          ) : (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Mở Link</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'live-room' && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h2 className="text-xl font-black text-white">{activeRoomTitle}</h2>
                <button
                  type="button"
                  onClick={() => setIsLiveCallActive(!isLiveCallActive)}
                  className={`px-6 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wide flex items-center gap-2 ${
                    isLiveCallActive ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isLiveCallActive ? 'Thoát Call' : 'Tham Gia Call Ngay'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Kỳ Duyên (Bạn)', isTalking: micOn, avatar: 'KD' },
                  { name: 'Minh Trí', isTalking: true, avatar: 'MT' },
                  { name: 'Bảo Ngọc', isTalking: false, avatar: 'BN' },
                  { name: 'AI MC Assistant 🤖', isTalking: true, avatar: 'AI' }
                ].map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto">
                      {m.avatar}
                    </div>
                    <p className="font-bold text-xs text-white">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {isMatchingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 text-center space-y-4">
            <h3 className="font-extrabold text-lg text-[#1B1F2E] dark:text-white">Ghép Đôi Luyện Nói 1-1</h3>
            <button
              onClick={() => setIsMatchingModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-[#2E68FF] text-white font-extrabold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
