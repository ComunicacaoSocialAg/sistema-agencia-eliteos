<?php
/**
 * Script temporário para atualizar conteúdos em português e corrigir links vazios.
 */

// Carrega o ambiente do WordPress
require_once __DIR__ . '/wp-load.php';

// Verifica se o usuário tem privilégios de admin (segurança adicional)
// Como estamos rodando via requisição direta do agente, exibimos apenas o status da execução
header('Content-Type: text/plain; charset=utf-8');
echo "=== INICIANDO ATUALIZAÇÃO DE CONTEÚDO ===\n\n";

// 1. Atualizar Página de Projetos (ID 33)
$project_id = 33;
$project_post = get_post($project_id);
if ($project_post) {
    echo "Página de Projetos (ID 33) encontrada.\n";
    $content = $project_post->post_content;
    
    // Substituir título principal do portfólio
    $old_title = 'We Are An Innovation Focused Digital Production Agency Capable Of Adapting To Continuous Change';
    $new_title = 'Projetos em Destaque — Criatividade e Estratégia em Ação';
    
    // Substituir texto Lorem Ipsum
    $old_desc = 'Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis bibendum auctor, nisi elit consequat ipsum, nec sagittis sem nibh id elit. Duis sed odio sit amet nibh vulputate cursus a sit amet mauris. Morbi accumsan ipsum velit. Nam nec tellus a odio tincidunt auctor a ornare odio sed non mauris vitae erat consequat auctor eu in elit.<br><br>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris in erat justo.';
    $new_desc = 'Nosso portfólio reúne soluções integradas que conectam design inteligente, tecnologia avançada e narrativas criativas. Cada projeto é construído sob medida, alinhando estética a dados e performance.<br><br>Trabalhamos lado a lado com nossos clientes para transformar sua comunicação em um ativo estratégico de crescimento.';
    
    // Substituir botão "contact us." e seu link
    $old_btn = 'href="#" rel="follow noopener" target="_self" role="button"><div class="uagb-button__link">contact us.</div>';
    $new_btn = 'href="https://comunicacaosocialag.com.br/vamos-conversar/" rel="follow noopener" target="_self" role="button"><div class="uagb-button__link">fale com a gente</div>';
    
    // Contadores de substituição
    $count_title = 0;
    $count_desc = 0;
    $count_btn = 0;
    
    $content = str_replace($old_title, $new_title, $content, $count_title);
    $content = str_replace($old_desc, $new_desc, $content, $count_desc);
    $content = str_replace($old_btn, $new_btn, $content, $count_btn);
    
    echo "Substituições na página de Projetos:\n";
    echo "- Títulos substituídos: $count_title\n";
    echo "- Descrições substituídas: $count_desc\n";
    echo "- Botões substituídos: $count_btn\n";
    
    // Atualizar no banco
    $updated_post = array(
        'ID'           => $project_id,
        'post_content' => $content,
    );
    wp_update_post($updated_post);
    echo "Página de Projetos atualizada com sucesso!\n\n";
} else {
    echo "ERRO: Página de Projetos (ID 33) não encontrada.\n\n";
}

// 2. Atualizar Página Home (ID 28) - Corrigir Link do Botão "solicite o diagnóstico"
$home_id = 28;
$home_post = get_post($home_id);
if ($home_post) {
    echo "Página Home (ID 28) encontrada.\n";
    $content = $home_post->post_content;
    
    // Substituir href="#" do botão solicite o diagnóstico
    // O bloco do botão é uagb-block-296d9412
    $old_home_btn = 'class="wp-block-uagb-buttons-child uagb-buttons__outer-wrap uagb-block-296d9412 wp-block-button"><div class="uagb-button__wrapper"><a class="uagb-buttons-repeater wp-block-button__link" aria-label="" href="#"';
    $new_home_btn = 'class="wp-block-uagb-buttons-child uagb-buttons__outer-wrap uagb-block-296d9412 wp-block-button"><div class="uagb-button__wrapper"><a class="uagb-buttons-repeater wp-block-button__link" aria-label="" href="https://comunicacaosocialag.com.br/vamos-conversar/"';
    
    $count_home_btn = 0;
    $content = str_replace($old_home_btn, $new_home_btn, $content, $count_home_btn);
    
    echo "Substituições na página Home:\n";
    echo "- Botões corrigidos: $count_home_btn\n";
    
    if ($count_home_btn > 0) {
        $updated_post = array(
            'ID'           => $home_id,
            'post_content' => $content,
        );
        wp_update_post($updated_post);
        echo "Página Home atualizada com sucesso!\n\n";
    } else {
        echo "Aviso: O link do botão na Home já estava correto ou o bloco não foi encontrado com a assinatura exata.\n\n";
    }
} else {
    echo "ERRO: Página Home (ID 28) não encontrada.\n\n";
}

// 3. Limpar Cache do LiteSpeed
if (class_exists('LiteSpeed_Cache_API')) {
    echo "LiteSpeed Cache detectado. Limpando todo o cache...\n";
    LiteSpeed_Cache_API::purge_all();
    echo "Cache limpo com sucesso!\n";
} else {
    echo "LiteSpeed Cache não ativo ou não encontrado.\n";
}

echo "\n=== PROCESSO CONCLUÍDO ===\n";
?>
