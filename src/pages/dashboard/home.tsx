import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  DocumentText1,
  Tag,
  Book,
  VideoCircle,
  Edit2,
  TickCircle,
  People,
  Play,
  Eye,
  Link2,
  Youtube,
  TrendUp,
} from "iconsax-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/theme-context";
import {
  GET_YOUTUBE_CHANNEL_INFO,
  GET_YOUTUBE_CHANNEL_VIDEOS,
  GET_SETTINGS,
} from "../../lib/graphql/queries";
import { UPDATE_SETTINGS } from "../../lib/graphql/mutations";
import { useToast } from "../../context/toast-context";
import { cn } from "../../lib/utils";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  durationInSeconds: number;
  isShort: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

const DashboardHome = () => {
  useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const { data: settingsData } = useQuery(GET_SETTINGS);

  const [fetchChannelInfo, { data: channelData, loading: loadingChannel }] =
    useLazyQuery(GET_YOUTUBE_CHANNEL_INFO);

  const [fetchChannelVideos, { data: videosData, loading: loadingVideos }] =
    useLazyQuery(GET_YOUTUBE_CHANNEL_VIDEOS);

  const [updateYoutubeUrl, { loading: updating }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: (data) => {
      setIsEditing(false);
      if (data.updateSettings.youtubeChannelUrl) {
        const url = data.updateSettings.youtubeChannelUrl;
        fetchChannelInfo({ variables: { url } });
        fetchChannelVideos({ variables: { url, maxResults: 50 } });
        toast.success(
          "Chaîne YouTube enregistrée",
          "Votre chaîne YouTube a été connectée avec succès"
        );
      }
    },
    onError: (error) => {
      console.error("Error updating YouTube URL:", error);
      toast.error(
        "Échec de l'enregistrement",
        error.message || "Veuillez vérifier l'URL et réessayer"
      );
    },
  });

  // Fetch channel info and videos on mount if URL exists
  useEffect(() => {
    const channelUrl = settingsData?.settings?.youtubeChannelUrl;
    if (channelUrl) {
      fetchChannelInfo({ variables: { url: channelUrl } });
      fetchChannelVideos({ variables: { url: channelUrl, maxResults: 50 } });
    }
  }, [settingsData, fetchChannelInfo, fetchChannelVideos]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.error("URL requise", "Veuillez entrer l'URL d'une chaîne YouTube");
      return;
    }
    updateYoutubeUrl({ variables: { youtubeChannelUrl: youtubeUrl } });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const channelInfo = channelData?.getYouTubeChannelInfo;
  const videos: YouTubeVideo[] = videosData?.getYouTubeChannelVideos || [];

  // Separate videos by format
  const longFormVideos = videos.filter((video) => !video.isShort);
  const shortsVideos = videos.filter((video) => video.isShort);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  };

  const quickActions = [
    {
      to: "/dashboard/extracts/new",
      icon: DocumentText1,
      iconColor: "#a855f7",
      bgColor: theme === "dark" ? "bg-purple-500/10" : "bg-purple-100",
      hoverBg: theme === "dark" ? "hover:bg-purple-500/20" : "hover:bg-purple-200",
      title: "Créer un Extrait",
      description: "Ajouter de nouveaux extraits anime avec personnages et timing",
    },
    {
      to: "/dashboard/themes",
      icon: Tag,
      iconColor: "#06b6d4",
      bgColor: theme === "dark" ? "bg-cyan-500/10" : "bg-cyan-100",
      hoverBg: theme === "dark" ? "hover:bg-cyan-500/20" : "hover:bg-cyan-200",
      title: "Gérer les Thèmes",
      description: "Organiser les extraits par thèmes vidéo",
    },
    {
      to: "/dashboard/extracts",
      icon: Book,
      iconColor: "#10b981",
      bgColor: theme === "dark" ? "bg-emerald-500/10" : "bg-emerald-100",
      hoverBg: theme === "dark" ? "hover:bg-emerald-500/20" : "hover:bg-emerald-200",
      title: "Voir la Bibliothèque",
      description: "Parcourir tous vos extraits enregistrés",
    },
    {
      to: "/dashboard/published-videos",
      icon: Link2,
      iconColor: "#f59e0b",
      bgColor: theme === "dark" ? "bg-amber-500/10" : "bg-amber-100",
      hoverBg: theme === "dark" ? "hover:bg-amber-500/20" : "hover:bg-amber-200",
      title: "Lier les Vidéos YouTube",
      description: "Lier les vidéos YouTube publiées aux extraits",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className={cn(
            "text-2xl md:text-3xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Bon retour !
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Gérez vos extraits anime et développez votre chaîne YouTube
        </p>
      </div>

      {/* YouTube Channel Section */}
      <div
        className={cn(
          "mb-8 rounded-2xl overflow-hidden border transition-colors",
          theme === "dark"
            ? "bg-[#12121a] border-gray-800"
            : "bg-white border-gray-200 shadow-sm"
        )}
      >
        {channelInfo && !isEditing ? (
          // Display Channel Info
          <div>
            {channelInfo.bannerUrl && (
              <div
                className="h-32 md:h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${channelInfo.bannerUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className={cn("p-6", channelInfo.bannerUrl && "pt-0")}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div className="flex gap-4 items-end">
                  <img
                    src={channelInfo.thumbnail}
                    alt={channelInfo.title}
                    className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover ring-4 flex-shrink-0",
                      theme === "dark" ? "ring-[#12121a]" : "ring-white shadow-lg",
                      channelInfo.bannerUrl && "-mt-8 md:-mt-10"
                    )}
                  />
                  <div>
                    <h2
                      className={cn(
                        "text-xl md:text-2xl font-bold mb-1",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}
                    >
                      {channelInfo.title}
                    </h2>
                    {channelInfo.customUrl && (
                      <p
                        className={cn(
                          "text-sm mb-2",
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        )}
                      >
                        {channelInfo.customUrl}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-sm line-clamp-2 max-w-2xl",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {channelInfo.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setYoutubeUrl(settingsData?.settings?.youtubeChannelUrl || "");
                    setIsEditing(true);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all",
                    theme === "dark"
                      ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                      : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                  )}
                >
                  <Edit2 size={16} variant="Bold" color={theme === "dark" ? "#a855f7" : "#9333ea"} />
                  Modifier
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div
                  className={cn(
                    "rounded-xl p-4",
                    theme === "dark" ? "bg-white/5" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <People size={18} color={theme === "dark" ? "#a855f7" : "#9333ea"} variant="Bold" />
                    <span
                      className={cn(
                        "text-xs md:text-sm",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Abonnés
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xl md:text-2xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    {formatNumber(channelInfo.subscriberCount)}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl p-4",
                    theme === "dark" ? "bg-white/5" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <VideoCircle size={18} color={theme === "dark" ? "#06b6d4" : "#0891b2"} variant="Bold" />
                    <span
                      className={cn(
                        "text-xs md:text-sm",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Vidéos
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xl md:text-2xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    {formatNumber(channelInfo.videoCount)}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl p-4",
                    theme === "dark" ? "bg-white/5" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendUp size={18} color={theme === "dark" ? "#10b981" : "#059669"} variant="Bold" />
                    <span
                      className={cn(
                        "text-xs md:text-sm",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Vues totales
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xl md:text-2xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    {formatNumber(channelInfo.viewCount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit/Add YouTube URL Form
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  theme === "dark" ? "bg-red-500/10" : "bg-red-100"
                )}
              >
                <Youtube size={24} variant="Bold" color="#ef4444" />
              </div>
              <div>
                <h2
                  className={cn(
                    "text-xl font-bold",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  {settingsData?.settings?.youtubeChannelUrl
                    ? "Modifier la chaîne YouTube"
                    : "Connecter une chaîne YouTube"}
                </h2>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Ajoutez l'URL de votre chaîne YouTube pour afficher les statistiques
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  URL de la chaîne YouTube
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/@yourchannelname"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    theme === "dark"
                      ? "bg-white/5 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  )}
                  required
                />
                <p
                  className={cn(
                    "text-xs mt-2",
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  )}
                >
                  Formats supportés : @nomutilisateur, /channel/ID, /c/nomutilisateur
                </p>
              </div>

              <div className="flex gap-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium transition-all",
                      theme === "dark"
                        ? "text-gray-300 bg-white/5 hover:bg-white/10"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={updating || loadingChannel}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-500/25"
                >
                  {updating || loadingChannel ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {loadingChannel ? "Vérification..." : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} variant="Bold" color="#ffffff" />
                      Enregistrer la chaîne
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className={cn(
                "p-5 rounded-2xl border transition-all group",
                theme === "dark"
                  ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                  : "bg-white border-gray-200 hover:shadow-md"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                  action.bgColor,
                  action.hoverBg
                )}
              >
                <Icon size={24} variant="Bold" color={action.iconColor} />
              </div>
              <h3
                className={cn(
                  "text-lg font-semibold mb-1",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                {action.title}
              </h3>
              <p
                className={cn(
                  "text-sm",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              >
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* YouTube Videos Section */}
      {channelInfo && (
        <>
          {/* Long-form Videos */}
          {longFormVideos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === "dark" ? "bg-red-500/10" : "bg-red-100"
                  )}
                >
                  <Play size={20} variant="Bold" color="#ef4444" />
                </div>
                <div>
                  <h2
                    className={cn(
                      "text-xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    Vidéos longues
                  </h2>
                  <p className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
                    {longFormVideos.length} vidéos
                  </p>
                </div>
              </div>

              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mb-4" />
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Chargement des vidéos...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {longFormVideos.map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "rounded-xl overflow-hidden border transition-all group",
                        theme === "dark"
                          ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                          : "bg-white border-gray-200 hover:shadow-md"
                      )}
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                          {formatDuration(video.durationInSeconds)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          className={cn(
                            "font-semibold line-clamp-2 mb-2 transition-colors",
                            theme === "dark"
                              ? "text-white group-hover:text-purple-400"
                              : "text-gray-900 group-hover:text-purple-600"
                          )}
                        >
                          {video.title}
                        </h3>
                        <div
                          className={cn(
                            "flex items-center gap-3 text-sm",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <Eye size={14} color={theme === "dark" ? "#6b7280" : "#6b7280"} />
                            <span>{formatNumber(video.viewCount)}</span>
                          </div>
                          <span>{formatDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shorts */}
          {shortsVideos.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === "dark" ? "bg-pink-500/10" : "bg-pink-100"
                  )}
                >
                  <VideoCircle size={20} variant="Bold" color="#ec4899" />
                </div>
                <div>
                  <h2
                    className={cn(
                      "text-xl font-bold",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    Shorts
                  </h2>
                  <p className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
                    {shortsVideos.length} vidéos courtes
                  </p>
                </div>
              </div>

              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent mb-4" />
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Chargement des shorts...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {shortsVideos.map((video) => (
                    <a
                      key={video.id}
                      href={`https://www.youtube.com/shorts/${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "rounded-xl overflow-hidden border transition-all group",
                        theme === "dark"
                          ? "bg-[#12121a] border-gray-800 hover:border-gray-700"
                          : "bg-white border-gray-200 hover:shadow-md"
                      )}
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-[9/16] object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          {formatDuration(video.durationInSeconds)}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3
                          className={cn(
                            "font-medium text-sm line-clamp-2 mb-2 transition-colors",
                            theme === "dark"
                              ? "text-white group-hover:text-pink-400"
                              : "text-gray-900 group-hover:text-pink-600"
                          )}
                        >
                          {video.title}
                        </h3>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          <Eye size={12} color={theme === "dark" ? "#6b7280" : "#6b7280"} />
                          <span>{formatNumber(video.viewCount)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHome;
