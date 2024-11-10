import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ERROR'),
      ),
      body: Center(
        child: Column(
          children: [
            const Text('ERROR 404'),
            const Text('Page not found'),
            const SizedBox(
              height: 8,
            ),
            ElevatedButton(
                onPressed: () {
                  context.go('/');
                },
                child: const Text('Back'))
          ],
        ),
      ),
    );
  }
}
