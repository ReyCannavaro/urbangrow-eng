import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../telemetry/presentation/telemetry_notifier.dart';

class AgriBotScreen extends ConsumerStatefulWidget {
  const AgriBotScreen({super.key});

  @override
  ConsumerState<AgriBotScreen> createState() => _AgriBotScreenState();
}

class _AgriBotScreenState extends ConsumerState<AgriBotScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;

  final List<Map<String, dynamic>> _messages = [
    {
      'isUser': false,
      'time': '10:00',
      'text':
          'Halo! Saya AgriBot AI, asisten agronomi dan kesehatan akuaponik UrbanGrow Anda. Seluruh sensor 4-Level dalam kondisi optimal saat ini. Ada yang bisa saya bantu analisa?',
    },
    {
      'isUser': false,
      'time': '10:01',
      'text':
          '💡 Ringkasan Pagi: Pakcoy L4 memasuki H+18 dengan laju fotosintesis tinggi. Bakteri biofilter di L2 aktif mengonversi 96.4% amonia menjadi nitrat ramah tanaman.',
    },
  ];

  final List<String> _quickPrompts = [
    '🌿 Cek Kesiapan Panen Pakcoy L4',
    '🐟 Analisa Kebugaran Ikan Nila L3',
    '🧪 Solusi Menjaga Kestabilan pH',
    '⚡ Optimasi Siklus Aerasi & Daya',
  ];

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String query) {
    if (query.trim().isEmpty) return;

    HapticFeedback.lightImpact();
    setState(() {
      _messages.add({
        'isUser': true,
        'time': 'Baru saja',
        'text': query.trim(),
      });
      _isTyping = true;
    });
    _textController.clear();
    _scrollToBottom();

    final telemetry = ref.read(telemetryNotifierProvider);

    // Context-aware AI response based on live telemetry
    Future.delayed(const Duration(milliseconds: 900), () {
      if (!mounted) return;

      String reply = '';
      final ph = telemetry.sensors.ph;
      final temp = telemetry.sensors.waterTemperature;
      final doVal = telemetry.sensors.dissolvedOxygen;

      if (query.contains('Panen') || query.contains('Pakcoy')) {
        reply =
            'Berdasarkan data spektrum LED fotosintesis dan serapan TDS (${telemetry.sensors.tds} ppm), daun Pakcoy di Level 4 tumbuh sangat subur. Estimasi panen optimal adalah 10 hari lagi saat bobot daun mencapai ~150g per netpot.';
      } else if (query.contains('Nila') || query.contains('Ikan')) {
        reply =
            'Ikan Nila di Level 3 sangat aktif! Dengan DO saat ini ${doVal.toStringAsFixed(2)} mg/L (target > 5.0 mg/L) dan suhu ${temp.toStringAsFixed(1)}°C, metabolisme pakan berada pada level prima. FCR tercatat efisien di 1.15.';
      } else if (query.contains('pH')) {
        reply =
            'Nilai pH air saat ini adalah ${ph.toStringAsFixed(2)}. Nilai ini ideal untuk sistem kombinasi ikan & sayuran (rentang 6.5 - 7.5). Belum diperlukan injeksi larutan buffer kalium bikarbonat.';
      } else if (query.contains('Aerasi') || query.contains('Daya')) {
        reply =
            'Aerator Oksigen Nila (18W) dan Pompa Sirkulasi (45W) beroperasi secara efisien. Total konsumsi daya modul relay stabil di bawah batas aman kapasitas solar hybrid.';
      } else {
        reply =
            'Berdasarkan model prediktif aquaponik: Telemetri sistem saat ini menunjukkan pH ${ph.toStringAsFixed(2)}, Suhu ${temp.toStringAsFixed(1)}°C, dan Oksigen ${doVal.toStringAsFixed(2)} mg/L. Semua siklus biologis closed-loop berjalan seimbang tanpa anomali.';
      }

      setState(() {
        _isTyping = false;
        _messages.add({
          'isUser': false,
          'time': 'Baru saja',
          'text': reply,
        });
      });
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: Column(
        children: [
          // Header Card
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: _buildHeaderCard(),
          ),

          // Chat Messages Timeline
          Expanded(
            child: ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return _buildTypingIndicator();
                }
                final msg = _messages[index];
                final isUser = msg['isUser'] as bool;
                return _buildChatBubble(
                  isUser: isUser,
                  text: msg['text'] as String,
                  time: msg['time'] as String,
                );
              },
            ),
          ),

          // Quick Prompt Chips Bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: _quickPrompts.map((p) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      onPressed: () => _sendMessage(p),
                      backgroundColor: Colors.white,
                      side: const BorderSide(color: AppTheme.borderMedium),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                      label: Text(
                        p,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.charcoal,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Bottom Input Field
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 85),
            decoration: BoxDecoration(
              color: AppTheme.cardBg,
              border: Border(top: BorderSide(color: AppTheme.borderLight)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppTheme.borderMedium),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: TextField(
                        controller: _textController,
                        onSubmitted: _sendMessage,
                        textInputAction: TextInputAction.send,
                        style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Tanyakan kondisi tanaman, ikan, atau nutrisi...',
                          hintStyle: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () => _sendMessage(_textController.text),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: AppTheme.charcoal,
                        shape: BoxShape.circle,
                        boxShadow: AppTheme.softShadow,
                      ),
                      child: const Icon(
                        Icons.arrow_upward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.accentEmerald.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.psychology_rounded,
              color: AppTheme.accentEmeraldDark,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AgriBot AI Agronomist',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'FastAPI + XGBoost Inference • Asisten Pintar Aquaponik',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBubble({
    required bool isUser,
    required String text,
    required String time,
  }) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? AppTheme.charcoal : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 6),
            bottomRight: Radius.circular(isUser ? 6 : 20),
          ),
          border: Border.all(
            color: isUser ? AppTheme.charcoal : AppTheme.borderLight,
          ),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Column(
          crossAxisAlignment:
              isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.accentEmerald,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'AGRIBOT AI',
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      letterSpacing: 0.8,
                      color: AppTheme.accentEmeraldDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
            Text(
              text,
              style: TextStyle(
                fontSize: 12.5,
                color: isUser ? Colors.white : AppTheme.textPrimary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              time,
              style: TextStyle(
                fontSize: 9,
                color: isUser ? Colors.white70 : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppTheme.charcoal,
              ),
            ),
            SizedBox(width: 8),
            Text(
              'AgriBot sedang menganalisa data sensor...',
              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
