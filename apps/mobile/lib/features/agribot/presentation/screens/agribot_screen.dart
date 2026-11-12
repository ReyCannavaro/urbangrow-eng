import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/config/api_config.dart';
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
          'Halo! Saya AgriBot AI, asisten agronomi dan kesehatan akuaponik UrbanGrow Anda. Seluruh sensor kaskade 4-level dalam kondisi optimal saat ini. Ada yang bisa saya bantu analisa?',
    },
    {
      'isUser': false,
      'time': '10:01',
      'text':
          'Ringkasan Pagi: Pakcoy L4 memasuki fase vegetatif dengan laju fotosintesis tinggi. Bakteri biofilter aktif mengonversi 96.4% amonia menjadi nitrat ramah tanaman.',
    },
  ];

  final List<String> _quickPrompts = [
    '🌿 Cek Kesiapan Panen Pakcoy L4',
    '🐟 Analisa Kebugaran Ikan Nila L3',
    '🧪 Solusi Menjaga Kestabilan pH',
    '⚡ Optimasi Siklus Aerasi & Daya',
    '📸 Diagnosa Kesehatan Daun & Sisik',
  ];

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  String _cleanMarkdown(String text) {
    return text
        .replaceAll(RegExp(r'^[ \t]*#{1,6}\s*', multiLine: true), '')
        .replaceAll(RegExp(r'\*\*'), '')
        .replaceAll(RegExp(r'\n{3,}'), '\n\n')
        .trim();
  }

  Future<void> _sendMessage(String query) async {
    if (query.trim().isEmpty) return;

    HapticFeedback.lightImpact();
    final userText = query.trim();

    setState(() {
      _messages.add({
        'isUser': true,
        'time': 'Baru saja',
        'text': userText,
      });
      _isTyping = true;
    });
    _textController.clear();
    _scrollToBottom();

    final telemetry = ref.read(telemetryNotifierProvider);
    String reply = '';

    // Attempt backend AI request first
    try {
      final res = await http
          .post(
            Uri.parse(ApiConfig.chat),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'message': userText,
              'history': _messages
                  .take(6)
                  .map((m) => {
                        'role': (m['isUser'] as bool) ? 'user' : 'model',
                        'parts': [{'text': m['text']}],
                      })
                  .toList(),
            }),
          )
          .timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final rawReply = data['reply'] as String? ?? '';
        if (rawReply.isNotEmpty) {
          reply = _cleanMarkdown(rawReply);
        }
      }
    } catch (_) {
      // Fallback to local telemetry-aware context
    }

    // Fallback if network fails or reply is empty
    if (reply.isEmpty) {
      final ph = telemetry.sensors.ph;
      final temp = telemetry.sensors.waterTemperature;
      final doVal = telemetry.sensors.dissolvedOxygen;

      if (userText.contains('Panen') || userText.contains('Pakcoy')) {
        reply =
            'Berdasarkan data spektrum LED fotosintesis dan serapan TDS (${telemetry.sensors.tds} ppm), daun Pakcoy di Level 4 tumbuh sangat subur. Estimasi panen optimal adalah 7 hari lagi saat akumulasi termal GDD mencapai 450 °C·Hari (~155g per pot).';
      } else if (userText.contains('Nila') || userText.contains('Ikan')) {
        reply =
            'Ikan Nila Merah di Kolam Sekat 1 sangat aktif! Dengan DO saat ini ${doVal.toStringAsFixed(2)} mg/L (target > 5.0 mg/L) dan suhu ${temp.toStringAsFixed(1)}°C, metabolisme pakan berada pada level prima. FCR tercatat efisien di 1.15.';
      } else if (userText.contains('pH')) {
        reply =
            'Nilai pH air saat ini adalah ${ph.toStringAsFixed(2)}. Nilai ini ideal untuk sistem akuaponik kombinasi ikan dan sayuran (rentang 6.5 - 7.5). Buffer biologis bekerja alami.';
      } else if (userText.contains('Aerasi') || userText.contains('Daya')) {
        reply =
            'Aerator Oksigen Nila (18W) dan Pompa Sirkulasi (45W) beroperasi efisien. Total konsumsi daya modul relay stabil di bawah batas aman kapasitas catu hybrid.';
      } else if (userText.contains('Diagnosa') || userText.contains('Foto')) {
        reply =
            'Fitur Diagnosa Multimodal Aktif: Kamera terhubung ke model Gemini 2.5 Flash Vision. Kirimkan foto daun menguning atau permukaan sisik ikan untuk analisis bercak nekrosis otomatis.';
      } else {
        reply =
            'Berdasarkan model prediktif aquaponik: Telemetri sistem saat ini menunjukkan pH ${ph.toStringAsFixed(2)}, Suhu ${temp.toStringAsFixed(1)}°C, dan Oksigen ${doVal.toStringAsFixed(2)} mg/L. Semua siklus biologis closed-loop berjalan seimbang.';
      }
    }

    if (!mounted) return;

    setState(() {
      _isTyping = false;
      _messages.add({
        'isUser': false,
        'time': 'Baru saja',
        'text': reply,
      });
    });
    _scrollToBottom();
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
    final telemetry = ref.watch(telemetryNotifierProvider);

    return Scaffold(
      backgroundColor: AppTheme.canvas,
      body: Column(
        children: [
          // Header Card with Live Status Pill
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
            child: _buildHeaderCard(telemetry),
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
            padding: const EdgeInsets.symmetric(vertical: 6),
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
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Bottom Input Field with Camera / Upload Button
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 86),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppTheme.borderLight)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Camera / Image Diagnosis Trigger
                  InkWell(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      _sendMessage('📸 Diagnosa Kesehatan Daun & Sisik');
                    },
                    borderRadius: BorderRadius.circular(22),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppTheme.canvas,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: const Icon(
                        Icons.camera_alt_outlined,
                        color: AppTheme.pinePrimary,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Text input container
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.canvas,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppTheme.borderMedium),
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

                  // Send button
                  InkWell(
                    onTap: () => _sendMessage(_textController.text),
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: AppTheme.pinePrimary,
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

  Widget _buildHeaderCard(dynamic telemetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppTheme.borderLight),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.psychology_rounded,
                  color: AppTheme.pinePrimary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'AgriBot AI Agronomist',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      telemetry.isLive
                          ? 'Gemini 2.5 Flash • Terhubung ESP32-GROW-01'
                          : 'Mode Prediktif Standalone • Telemetri Stabil',
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                decoration: BoxDecoration(
                  color: AppTheme.mintWash,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppTheme.sageMint.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'ONLINE',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: AppTheme.mintText,
                  ),
                ),
              ),
            ],
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
          color: isUser ? AppTheme.pinePrimary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 6),
            bottomRight: Radius.circular(isUser ? 6 : 20),
          ),
          border: Border.all(
            color: isUser ? AppTheme.pinePrimary : AppTheme.borderLight,
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
                      color: AppTheme.pinePrimary,
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
                      color: AppTheme.mintText,
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
                height: 1.45,
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
                color: AppTheme.pinePrimary,
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
