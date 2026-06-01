import { useEffect, useState } from 'react';
import { Star, Crown, Trophy, Award, Medal, TrendingUp } from 'lucide-react';
import { playerApi } from '../api';
import { Player } from '../types';
import { useNotificationStore } from '../store';

type PlayerType = 'star' | 'demon' | 'tech' | 'entertainment';

const typeLabels: Record<PlayerType, string> = {
  star: '明星打手',
  demon: '魔王打手',
  tech: '技术打手',
  entertainment: '娱乐打手',
};

const typeColors: Record<PlayerType, { bg: string; text: string; border: string; gradient: string }> = {
  star: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    gradient: 'from-yellow-400 to-orange-500',
  },
  demon: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    gradient: 'from-red-500 to-pink-600',
  },
  tech: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500',
  },
  entertainment: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-violet-600',
  },
};

const typeIcons: Record<PlayerType, typeof Star> = {
  star: Star,
  demon: Crown,
  tech: Award,
  entertainment: Trophy,
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await playerApi.getPlayers({ page: 1, pageSize: 100 });
      if (response.success && response.data) {
        setPlayers(response.data.items);
      }
    } catch (error) {
      addNotification('error', '加载打手列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getType = (player: Player): PlayerType => {
    const type = player.type as PlayerType;
    return typeLabels[type] ? type : 'tech';
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const groupByType = () => {
    const groups: Record<PlayerType, Player[]> = {
      star: [],
      demon: [],
      tech: [],
      entertainment: [],
    };
    players.forEach((player) => {
      const type = getType(player);
      groups[type].push(player);
    });
    Object.keys(groups).forEach((key) => {
      groups[key as PlayerType].sort((a, b) => b.totalEarnings - a.totalEarnings);
    });
    return groups;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const groupedPlayers = groupByType();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">哈夫天梯</h1>
          <p className="text-gray-500 mt-1">展示我们的顶级打手排行</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Object.entries(groupedPlayers).map(([type, typePlayers]) => {
          const playerType = type as PlayerType;
          const colors = typeColors[playerType];
          const Icon = typeIcons[playerType];
          
          return (
            <div key={type} className={`${colors.bg} rounded-2xl border ${colors.border} p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.gradient}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-xl font-bold ${colors.text}`}>{typeLabels[playerType]}</h2>
                <span className="ml-auto text-sm text-gray-500">{typePlayers.length}人</span>
              </div>

              <div className="space-y-4">
                {typePlayers.slice(0, 3).map((player, index) => (
                  <div
                    key={player.id}
                    className={`bg-white rounded-xl p-4 shadow-md ${
                      index === 0 ? 'ring-2 ring-yellow-400 scale-[1.02]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                          {player.playerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -top-1 -left-1">
                          {getRankIcon(index + 1)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {player.playerName}
                          {index === 0 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">ID: {player.playerId}</div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            <span className="text-gray-500">评分</span>
                            <span className="font-medium ml-1 text-yellow-600">{player.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-sm">
                            <span className="text-gray-500">信誉</span>
                            <span className={`font-medium ml-1 ${getCreditScoreColor(player.creditScore)}`}>
                              {player.creditScore}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">总收益</div>
                        <div className={`font-bold ${colors.text}`}>¥{player.totalEarnings.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          完成订单 <span className="font-medium text-gray-700">{player.completedCount}</span> 单
                        </span>
                        <span className="text-gray-500">
                          分成 <span className="font-medium text-blue-600">{player.shareRatio}%</span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>完成率</span>
                          <span>{player.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors.gradient}`}
                            style={{ width: `${player.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {typePlayers.length > 3 && (
                  <div className="space-y-2">
                    {typePlayers.slice(3).map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                            {player.playerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{player.playerName}</span>
                        </div>
                        <span className={`text-sm font-medium ${colors.text}`}>¥{player.totalEarnings.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {typePlayers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">暂无打手</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">全体打手排行</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">打手</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">信誉分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">评分</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">完成率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总收益</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...players]
                .sort((a, b) => b.totalEarnings - a.totalEarnings)
                .map((player, index) => {
                  const type = getType(player);
                  const colors = typeColors[type];
                  return (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className={`font-bold ${index < 3 ? colors.text : 'text-gray-500'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                            {player.playerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{player.playerName}</div>
                            <div className="text-sm text-gray-500">ID: {player.playerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {typeLabels[type]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${getCreditScoreColor(player.creditScore)}`}>
                          {player.creditScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-gray-900">{player.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${colors.gradient}`}
                              style={{ width: `${player.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{player.completionRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {player.completedCount} / {player.orderCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${colors.text}`}>¥{player.totalEarnings.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
